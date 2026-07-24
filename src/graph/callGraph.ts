import { CallSite, SymbolInformation } from '../models/types';
import { SymbolResolver } from '../indexer/symbolResolver';

export interface IncomingCallResult {
  callerSymbol: SymbolInformation;
  callSite: CallSite;
}

export interface OutgoingCallResult {
  targetSymbol?: SymbolInformation;
  targetName: string;
  targetClass?: string | null;
  callSite: CallSite;
}

export class CallGraph {
  // callerSymbolId -> CallSite[]
  private outgoingMap: Map<string, CallSite[]> = new Map();
  // targetName -> CallSite[] (index for fast incoming call resolution)
  private incomingNameMap: Map<string, CallSite[]> = new Map();
  // Map of fileUri -> CallSite[] (for quick cleanup on file edit/delete)
  private fileCallSites: Map<string, CallSite[]> = new Map();

  constructor(private symbolResolver: SymbolResolver) {}

  public addCallSite(callSite: CallSite): void {
    let outgoing = this.outgoingMap.get(callSite.callerSymbolId);
    if (!outgoing) {
      outgoing = [];
      this.outgoingMap.set(callSite.callerSymbolId, outgoing);
    }
    outgoing.push(callSite);

    let incByName = this.incomingNameMap.get(callSite.targetName);
    if (!incByName) {
      incByName = [];
      this.incomingNameMap.set(callSite.targetName, incByName);
    }
    incByName.push(callSite);

    let fileSites = this.fileCallSites.get(callSite.fileUri);
    if (!fileSites) {
      fileSites = [];
      this.fileCallSites.set(callSite.fileUri, fileSites);
    }
    fileSites.push(callSite);
  }

  public removeFile(fileUri: string): void {
    const sites = this.fileCallSites.get(fileUri) || [];
    for (const site of sites) {
      const outgoing = this.outgoingMap.get(site.callerSymbolId);
      if (outgoing) {
        const idx = outgoing.indexOf(site);
        if (idx !== -1) {
          outgoing.splice(idx, 1);
        }
        if (outgoing.length === 0) {
          this.outgoingMap.delete(site.callerSymbolId);
        }
      }

      const incByName = this.incomingNameMap.get(site.targetName);
      if (incByName) {
        const idx = incByName.indexOf(site);
        if (idx !== -1) {
          incByName.splice(idx, 1);
        }
        if (incByName.length === 0) {
          this.incomingNameMap.delete(site.targetName);
        }
      }
    }
    this.fileCallSites.delete(fileUri);
  }

  public clear(): void {
    this.outgoingMap.clear();
    this.incomingNameMap.clear();
    this.fileCallSites.clear();
  }

  /**
   * Get all symbols/calls made BY the given symbolId.
   */
  public getOutgoingCalls(symbolId: string): OutgoingCallResult[] {
    const callSites = this.outgoingMap.get(symbolId) || [];
    const results: OutgoingCallResult[] = [];

    for (const site of callSites) {
      let targetSymbol: SymbolInformation | undefined;

      if (site.callType === 'function') {
        const funcSymbolId = site.targetClass
          ? `function:${site.targetClass}`
          : `function:${site.targetName}`;
        targetSymbol = this.symbolResolver.getSymbol(funcSymbolId);
        if (!targetSymbol) {
          targetSymbol = this.symbolResolver.getSymbol(`function:${site.targetName}`);
        }
      } else if (site.targetClass) {
        targetSymbol = this.symbolResolver.resolveMethod(site.targetClass, site.targetName);
      } else {
        const callerSymbol = this.symbolResolver.getSymbol(symbolId);
        if (callerSymbol && callerSymbol.containerName) {
          targetSymbol = this.symbolResolver.resolveMethod(callerSymbol.containerName, site.targetName);
        }
      }

      results.push({
        targetSymbol,
        targetName: site.targetName,
        targetClass: site.targetClass,
        callSite: site
      });
    }

    return results;
  }

  /**
   * Get all symbols that CALL the given symbolId.
   */
  public getIncomingCalls(targetSymbolId: string): IncomingCallResult[] {
    const targetSymbol = this.symbolResolver.getSymbol(targetSymbolId);
    const results: IncomingCallResult[] = [];

    const targetName = targetSymbol ? targetSymbol.name : this.extractNameFromId(targetSymbolId);
    const targetContainer = targetSymbol ? targetSymbol.containerName : this.extractContainerFromId(targetSymbolId);

    const validTargetClasses = new Set<string>();
    if (targetContainer) {
      validTargetClasses.add(targetContainer);
      const descendants = this.symbolResolver.getDescendants(targetContainer);
      for (const d of descendants) {
        validTargetClasses.add(d);
      }
    }

    const candidateSites = this.incomingNameMap.get(targetName) || [];

    for (const site of candidateSites) {
      const callerSymbol = this.symbolResolver.getSymbol(site.callerSymbolId);
      if (!callerSymbol) continue;

      let isMatch = false;

      if (site.callType === 'function' && (targetSymbolId.startsWith('function:') || !targetContainer)) {
        isMatch = true;
      } else if (site.targetClass) {
        if (validTargetClasses.has(site.targetClass)) {
          isMatch = true;
        }
      } else if (callerSymbol.containerName && validTargetClasses.has(callerSymbol.containerName)) {
        isMatch = true;
      }

      if (isMatch) {
        results.push({
          callerSymbol,
          callSite: site
        });
      }
    }

    return results;
  }

  private extractNameFromId(id: string): string {
    const parts = id.split('::');
    if (parts.length > 1) return parts[1];
    if (id.startsWith('function:')) return id.substring('function:'.length);
    return id;
  }

  private extractContainerFromId(id: string): string {
    const parts = id.split('::');
    if (parts.length > 1) return parts[0];
    return '';
  }
}
