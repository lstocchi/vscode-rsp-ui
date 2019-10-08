# Server Connector

[![Build Status](https://travis-ci.org/redhat-developer/vscode-rsp-ui.svg?branch=master)](https://travis-ci.org/redhat-developer/vscode-rsp-ui)
[![License](https://img.shields.io/badge/license-EPLv2.0-brightgreen.svg)](https://github.com/redhat-developer/vscode-rsp-ui/blob/master/README.md)
[![Visual Studio Marketplace](https://vsmarketplacebadge.apphb.com/version/redhat.vscode-rsp-ui.svg)](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-rsp-ui)
[![Gitter](https://badges.gitter.im/redhat-developer/server-connector.svg)](https://gitter.im/redhat-developer/server-connector?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

A Visual Studio Code extension that provides a unified UI for any RSP (Runtime Server Protocol) provider to contribute their RSP implementation to. 

## Warning: Not a standalone extension

This extension on its own provides no support for any specific runtimes. If you install only this extension, 
the views and actions may appear not to function. 

To be used properly, this extension requires other contributing extensions that provide implementations
that start or stop specific RSP instances and are capable of managing specific server or runtime types.

## Commands and features

![ screencast ](https://raw.githubusercontent.com/redhat-developer/vscode-rsp-ui/master/screencast/vscode-rsp-ui.gif)

This extension supports a number of commands for interacting with supported server adapters; these are accessible via the command menu (`Cmd+Shift+P` on macOS or `Ctrl+Shift+P` on Windows and Linux) and may be bound to keys in the normal way.

### Available Commands

   * `Add Server Location` - Selects the path of the server location and display in the SERVERS Explorer stack.
   * `Start` - From the list of servers present, select the server to start.
   * `Restart` - From the list of servers present, select the server to restart.
   * `Stop` - From the list of servers present, select the server to stop.
   * `Remove` - From the list of servers present, select the server to be removed.
   * `Debug` - From the list of servers present, select the server to run in Debug mode.
   * `Add Deployment to Server` - Add a deployable file or folder to the server to be published.
   * `Remove Deployment from Server` - Remove a deployment from the server.
   * `Publish Server (Full)` - Publish the server, synchronizing the content of deployments from your workspace to the server.
   * `Show Output Channel` - Select a particular server from the list to show its output channel in the editor.
   * `Edit Server` - View a JSON representation of your server in an editor, and submit changes to properties back to the RSP. 
   * `Download Runtime` - Some server types may expose to the user methods to download a version of specific runtimes or frameworks, extract them, and set them up to be used by the RSP. 
   * `Server Actions` - Some server types may expose to the user arbitrary actions that the user may invoke, such as changing some configuration options, opening a web browser, or editing a configuration file. These server-contributed actions have few restrictions placed on them by the framework other than what may be done on the client-side. 
   * `Run on Server` - By selecting an application (e.g war file) directly from the explorer context view, the application will be deployed and the server started.
   * `Debug on Server` - By selecting an application (e.g war file) directly from the explorer context view, the application will be deployed and the server started in Debug mode.


### Supported Servers
   * This extension has no built-in support for any specific server type
   * Support for individual server types is contributed by other extensions catering to their specific server type.

## Extension Settings

   This extension contributes the following settings:

   * `vscodeAdapters.showChannelOnServerOutput`: enable/disable the server output channel logs
   * `java.home`: Specifies the path to a JDK (version 8 or newer) which will be used to launch the Runtime Server Protocol (RSP) Server, as well as be the default java to launch any Java-based runtimes that the RSP will control.\nOn Windows, backslashes must be escaped, i.e.\n\"java.home\":\"C:\\\\Program Files\\\\Java\\\\jdk1.8.0_161\"
   * `rsp-ui.enableStartServerOnActivation`: Specifies which RSP Server have to be automatically started during activation. If option is disabled, user will have to manually start the RSP Server through command palette or context menu

## Server Parameters

   To change Server Parameters, right-click on the server you want to edit and select `Edit Server`
   
   * `"id"` - id server (read-only field, it cannot be changed)
   * `"args.override.boolean"` - allow to override program and vm arguments if set to true. The first time this flag is set to true and the server is started, two other parameters will be generated "vm.args.override.string" and "program.args.override.string". 
   * `"vm.args.override.string"` - allow to override vm arguments. Once you edited this flag, *make sure "args.override.boolean" is set to true before launching your server. Otherwise the server will attempt to auto-generate the launch arguments as it normally does.*
   * `"program.args.override.string"` - allow to override program arguments. Once you edited this flag, *make sure "args.override.boolean" is set to true before launching your server. Otherwise the server will attempt to auto-generate the launch arguments as it normally does.*
   * `"server.home.dir"` - the path where the server runtime is stored (read-only field, it cannot be changed)
   * `"deployables"` - the list of deployables. It contains all informations related to each deployable.
   * `"jboss.server.host"` - allow to set the host you want the current Jboss/Wildfly instance to bind to (default localhost)
   * `"jboss.server.port"` - allow to set the port you want the current Jboss/Wildfly instance to bind to (default 8080)
   * `"wildfly.server.config.file"` - name of the configuration file to be used for the current Jboss/Wildfly instance. The file has to be stored in the same folder as the default standalone.xml file. (e.g "wildfly.server.config.file": "newconfigfile.xml")
   * `"server.autopublish.enabled"` - Enable the autopublisher
   * `"server.autopublish.inactivity.limit"` - Set the inactivity limit before the autopublisher runs
   * `"vm.install.path"` - A string representation pointing to a java home. If not set, java.home will be used instead

## Q&A
---

### 1. How can i override Program and VM arguments?
Due to some issues and requests we received from users we added an additional flag "args.override.boolean" to allow to override program and vm arguments. 

When a user attempts to launch his server, we will first check the override boolean value to see if we are overriding. If the user is overriding (right-click your server -> Edit Server -> set "args.override.boolean": "true" ), we will generate the vm args and program args at that time and set them in the server object.

At this point the user will be able to see two other properties in the server editor: "vm.args.override.string" and "program.args.override.string".

Now, if the user wishes to change these flags, he can simply change the override.boolean value to true, and make whatever changes he requires to the program or vm arguments.      

If "args.override.boolean" is set to false, the server will attempt to auto-generate the launch arguments as it normally does when launched.
   
### 2. Can I run my Wildfly Server on a different port than the default one?
Yes. To run a Wildfly Server on a different port you first have to edit the port in the standalone.xml file. 

The next step is to add the following setting through the Server Editor in VScode.

Right-click your server -> Edit Server -> add "jboss.server.port": "8888". Change 8888 with the port you choose.

Now if you start the server it should run on the specified port.

### 3. Is there a video that explain how the VSCode Server Connector extension and the Runtime Server Protocol work?
Yes. This is the video you can watch to learn more about this extension https://www.youtube.com/watch?v=sP2Hlw-C_7I

   

-----------------------------------------------------------------------------------------------------------
## Install extension locally
This is an open source project open to anyone. This project welcomes contributions and suggestions!!

Download the most recent `adapters-<version>.vsix` file and install it by following the instructions [here](https://code.visualstudio.com/docs/editor/extension-gallery#_install-from-a-vsix). 

Stable releases are archived under http://download.jboss.org/jbosstools/adapters/snapshots/vscode-middleware-tools

## Community, discussion, contribution, and support

**Issues:** If you have an issue/feature-request with the rsp-ui extension, please file it [here](https://github.com/redhat-developer/vscode-rsp-ui/issues).

**Contributing:** Want to become a contributor and submit your own code? Have a look at our [development guide](https://github.com/redhat-developer/vscode-rsp-ui/blob/master/CONTRIBUTING.md).

**Chat:** Chat with us on [Gitter](https://gitter.im/redhat-developer/server-connector).

License
=======
EPL 2.0, See [LICENSE](LICENSE) for more information.
