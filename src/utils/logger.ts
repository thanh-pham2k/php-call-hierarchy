import * as vscode from 'vscode';

export class Logger {
  private static channel: vscode.OutputChannel | undefined;

  public static initialize(): void {
    if (!this.channel) {
      this.channel = vscode.window.createOutputChannel('PHP Call Hierarchy');
    }
  }

  public static info(message: string): void {
    const formatted = `[INFO ${new Date().toLocaleTimeString()}] ${message}`;
    console.log(formatted);
    this.channel?.appendLine(formatted);
  }

  public static warn(message: string): void {
    const formatted = `[WARN ${new Date().toLocaleTimeString()}] ${message}`;
    console.warn(formatted);
    this.channel?.appendLine(formatted);
  }

  public static error(message: string, error?: any): void {
    const errStr = error ? ` - ${error.stack || error.message || error}` : '';
    const formatted = `[ERROR ${new Date().toLocaleTimeString()}] ${message}${errStr}`;
    console.error(formatted);
    this.channel?.appendLine(formatted);
  }

  public static show(): void {
    this.channel?.show();
  }
}
