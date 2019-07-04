/*-----------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the EPL v2.0 License. See LICENSE file in the project root for license information.
 *-----------------------------------------------------------------------------------------------*/

'use strict';
import { apiBroker } from './api/implementation/apiBroker';
import { CommandHandler } from './extensionApi';
import { RSPClient, ServerState } from 'rsp-client';
import { ServerEditorAdapter } from './serverEditorAdapter';
import { ServerExplorer, ServerStateNode } from './serverExplorer';
import * as vscode from 'vscode';
import { APIBroker } from 'vscode-server-connector-api';

let serversExplorer: ServerExplorer;
let commandHandler: CommandHandler;

export async function activate(context: vscode.ExtensionContext): Promise<APIBroker> {
    serversExplorer = ServerExplorer.getInstance();
    commandHandler = new CommandHandler(serversExplorer);
    registerCommands(commandHandler, context);
    return apiBroker();
}

function registerCommands(commandHandler: CommandHandler, context: vscode.ExtensionContext) {
    const errorMessage = 'Unable to %ACTION% the server: ';
    const newLocal = [
        vscode.commands.registerCommand('server.startRSP',
            context => executeCommand(commandHandler.startRSP, commandHandler, context, errorMessage.replace('%ACTION%', 'start'))),
        vscode.commands.registerCommand('server.stopRSP',
            context => executeCommand(commandHandler.stopRSP, commandHandler, false, context, errorMessage.replace('%ACTION%', 'stop'))),
        vscode.commands.registerCommand('server.terminateRSP',
            context => executeCommand(commandHandler.stopRSP, commandHandler, true, context, errorMessage.replace('%ACTION%', 'start'))),
        vscode.commands.registerCommand('server.start',
            context => executeCommand(commandHandler.startServer, commandHandler, 'run', context, errorMessage.replace('%ACTION%', 'start'))),
        vscode.commands.registerCommand('server.restart',
            context => executeCommand(commandHandler.restartServer, commandHandler, 'run', context, errorMessage.replace('%ACTION%', 'restart in run mode'))),
        vscode.commands.registerCommand('server.debug',
            context => executeCommand(commandHandler.debugServer, commandHandler, context, errorMessage.replace('%ACTION%', 'debug'))),
        vscode.commands.registerCommand('server.restartDebug',
            context => executeCommand(commandHandler.restartServer, commandHandler, 'debug', context, errorMessage.replace('%ACTION%', 'restart in debug mode'))),
        vscode.commands.registerCommand('server.stop',
            context => executeCommand(commandHandler.stopServer, commandHandler, false, context, errorMessage.replace('%ACTION%', 'stop'))),
        vscode.commands.registerCommand('server.terminate',
            context => executeCommand(commandHandler.stopServer, commandHandler, true, context, errorMessage.replace('%ACTION%', 'terminate'))),
        vscode.commands.registerCommand('server.remove',
            context => executeCommand(commandHandler.removeServer, commandHandler, context, errorMessage.replace('%ACTION%', 'remove'))),
        vscode.commands.registerCommand('server.output',
            context => executeCommand(commandHandler.showServerOutput, commandHandler, context, 'Unable to show server output channel')),
        vscode.commands.registerCommand('server.addDeployment',
            context => executeCommand(commandHandler.addDeployment, commandHandler, context, errorMessage.replace('%ACTION%', 'add deployment to'))),
        vscode.commands.registerCommand('server.removeDeployment',
            context => executeCommand(commandHandler.removeDeployment, commandHandler, context, errorMessage.replace('%ACTION%', 'remove deployment to'))),
        vscode.commands.registerCommand('server.publishFull',
            context => executeCommand(commandHandler.fullPublishServer, commandHandler, context, errorMessage.replace('%ACTION%', 'publish to'))),
        vscode.commands.registerCommand('server.createServer',
            context => executeCommand(commandHandler.createServer, commandHandler, context, errorMessage.replace('%ACTION%', 'create'))),
        vscode.commands.registerCommand('server.addLocation',
            context => executeCommand(commandHandler.addLocation, commandHandler, context, 'Unable to detect any server: ')),
        vscode.commands.registerCommand('server.downloadRuntime',
            context => executeCommand(commandHandler.downloadRuntime, commandHandler, context, 'Unable to detect any runtime: ')),
        vscode.commands.registerCommand('server.editServer',
            context => executeCommand(commandHandler.editServer, commandHandler, context, 'Unable to edit server properties')),
        vscode.commands.registerCommand('server.infoServer',
            context => executeCommand(commandHandler.infoServer, commandHandler, context, 'Unable to retrieve server properties')),
        vscode.workspace.onDidSaveTextDocument(onDidSaveTextDocument),
        vscode.workspace.onDidCloseTextDocument(onDidCloseTextDocument)
    ];
    const subscriptions = newLocal;
    subscriptions.forEach(element => {
        context.subscriptions.push(element);
    }, this);
}

export function deactivate() {
    for (const rspProvider of serversExplorer.RSPServersStatus.values()) {
        if (rspProvider.client) {
            for (const server of rspProvider.state.serverStates) {
                stopServer(rspProvider.client, server);
            }
            rspProvider.client.shutdownServer();
        }
    }
}

function stopServer(client: RSPClient, val: ServerStateNode) {
    const oneStat: ServerStateNode = val;
    const stateNum = oneStat.state;
    if (stateNum !== ServerState.UNKNOWN
      && stateNum !== ServerState.STOPPED
      && stateNum !== ServerState.STOPPING) {
        client.getOutgoingHandler().stopServerAsync({ id: oneStat.server.id, force: true });
    }
}

function onDidSaveTextDocument(doc: vscode.TextDocument) {
    ServerEditorAdapter.getInstance(serversExplorer).onDidSaveTextDocument(doc).catch(err => {
        vscode.window.showErrorMessage(err);
    });
}

function onDidCloseTextDocument(doc: vscode.TextDocument) {
    ServerEditorAdapter.getInstance(serversExplorer).onDidCloseTextDocument(doc);
}

function executeCommand(command: (...args: any[]) => Promise<any>, thisArg: any, ...params: any[]) {
    const commandErrorLabel = typeof params[params.length - 1] === 'string' ? params[params.length - 1] : '';
    return command.call(thisArg, ...params).catch((err: string | Error) => {
        const error = typeof err === 'string' ? new Error(err) : err;
        const msg = error.hasOwnProperty('message') ? error.message : '';
        if (commandErrorLabel === '' && msg === '') {
            return;
        }
        vscode.window.showErrorMessage(`${commandErrorLabel} Extension backend error - ${msg.toLowerCase()}`);
    });
}
