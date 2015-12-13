/*jslint sloppy: true, white: true, eqeq: true */
/*global window, console, jQuery, $, btoa, alert, document, sap */

/**
 * SMPHelper.js
 * Sample helper file for kapsel sample application
 * 
 * 
 * @author Marvin Hoffmann, Mobile Innovation Technology, SAP Germany
 * @version 1.5
 * @since 2015-12-10
 * 
 * @alias SMPHelper
 */

//Server Connection Details

// SMP Application ID
var appId = "com.sap.mit.sample";
//Native certificate provider, use only if you want to use custom certificate based authentication, otherwise set to null
var customCertificateProvider = null; //"com.sap.mit.certprovider";
//Server is using https?
var serverProtocolIsHttp = "false";
//Server URL
var serverHost = "<YOUR SMP or HCPms SERVER>";
//Server Port
var serverPort = "<YOUR SMP or HCPms PORT>";

/**
 *
 * UI 
 * 
 * To keep this sample app simple add some UI elements here. 
 * In a productive application please use a project (MVC based) structure with xml views
 *
 */

//SAPUI5 app container holding the ui
var app = null;

//TextArea which is showing messages (or server respose) on the screen
var taResponse = null;

function initializeUI() {

    // create the first page (Main page)

    var layout = new sap.m.VBox();

    var lblDescr = new sap.m.Label();
    lblDescr.setText("Kapsel Sample Application");

    var btnTest = new sap.m.Button()
    btnTest.setText("GET Req");
    btnTest.setWidth("100px");
    btnTest.attachTap(

        function (oEvent) {

            console.log("Button pressed");

            try {

                var requestDomain = getConnectionURL(applicationContext);

                console.log("HTTP GET: " + requestDomain);

                $.ajax({
                    type: "GET",
                    url: requestDomain,
                    dataType: "text",
                    success: function (data) {

                        var response = ""
                        try {
                            response = JSON.stringify(data);
                            taResponse.setValue(response);
                        } catch (err) {
                            console.log("Error thrown when trying to convert response to json: " + err.message);
                            //most probably outcome is not json
                            taResponse.setValue(data);

                        }

                    },
                    error: function (xhr, textStatus, errorThrown) {
                        taResponse.setValue("HTTP Error: " + xhr.status + " " + textStatus + " - " + errorThrown);
                    }
                });

            } catch (exception) {
                taResponse.setValue("Exception: " + exception);
            }

        }

    );

    var btnServerReq = new sap.m.Button()
    btnServerReq.setText("GET Data");
    btnServerReq.setWidth("100px");
    btnServerReq.attachTap(function (oEvent) {

        console.log("Button pressed");

        try {

            var requestDomain = getConnectionURL(applicationContext) + appId;

            console.log("HTTP GET: " + requestDomain);

            $.ajax({
                type: "GET",
                url: requestDomain,
                dataType: "text",
                success: function (data) {

                    var response = ""
                    try {
                        response = JSON.stringify(data);
                        taResponse.setValue(response);
                    } catch (err) {
                        console.log("Error thrown when trying to convert response to json: " + err.message);
                        //most probably outcome is not json
                        taResponse.setValue(data);

                    }

                },
                error: function (xhr, textStatus, errorThrown) {
                    taResponse.setValue("HTTP Error: " + xhr.status + " " + textStatus + " - " + errorThrown);
                }
            });

        } catch (exception) {
            taResponse.setValue("Exception: " + exception);
        }

    });

    var btnAppContext = new sap.m.Button()
    btnAppContext.setText("AppContext");
    btnAppContext.setWidth("100px");
    btnAppContext.attachTap(function (oEvent) {

        if (applicationContext) {
            taResponse.setValue(JSON.stringify(applicationContext));
        } else {
            taResponse.setValue("Application Context not set. Maybe not registered?");
        }
    });

    var btnSettings = new sap.m.Button()
    btnSettings.setText("Settings");
    btnSettings.setWidth("100px");
    btnSettings.attachTap(function (oEvent) {

        app.to("page2");

    });

    //use global variable to adress it if available
    taResponse = new sap.m.TextArea({
        width: '100%', rows: 15,
        placeholder: "... Server Response ..."
    });

    layout.addItem(lblDescr);

    var hLayout = new sap.m.HBox();

    hLayout.addItem(btnServerReq);
    hLayout.addItem(btnTest);
    hLayout.addItem(btnAppContext);
    hLayout.addItem(btnSettings);

    layout.addItem(hLayout);
    layout.addItem(taResponse);


    var page1 = new sap.m.Page("page1", {
        title: "Home",
        showNavButton: false
    });

    page1.addContent(layout);

    //Settings screen
    //Page 2

    var sLayout = new sap.m.VBox();
    //sLayout.setVisible(false);

    var lblSDescr = new sap.m.Label();
    lblSDescr.setText("Settings Screen ...");

    var lblAppId = new sap.m.Label();
    if (typeof (appId) != "undefined") {
        lblAppId.setText("Used AppId: " + appId);
    }

    var btnUnregister = new sap.m.Button()
    btnUnregister.setText("Unregister");
    btnUnregister.attachTap(unregister);
    btnUnregister.setWidth("200px");

    var btnRegister = new sap.m.Button()
    btnRegister.setText("Register");
    btnRegister.attachTap(init);
    btnRegister.setWidth("200px");


    //Settings screen

    sLayout.addItem(lblSDescr);
    sLayout.addItem(lblAppId);
    sLayout.addItem(btnUnregister);
    sLayout.addItem(btnRegister);

    // create the second page with a back button
    var page2 = new sap.m.Page("page2", {
        title: "Settings",
        showNavButton: true,
        navButtonPress: function () {
            // go back to the previous page
            app.back();
        }
    });
    page2.addContent(sLayout);

    //dispay UI on the screen


    app = new sap.m.App("myApp", {
        initialPage: "page1"
    });

    // add both pages to the app
    app.addPage(page1).addPage(page2);
    // place the app into the HTML document (do it later explicitely when calling startApp)
    //app.placeAt("content");
}

/**
 * Will place the sapui 5 app into the html page
 *
 */
function startApp() {

    if (app) {
        app.to("page1");
        app.placeAt("content");
    }
}

/**
* 
* SMP Helper
*  Logic
* 
**/


//Cordova: Load the init() method when finish loading the Cordova Container
document.addEventListener("deviceready", init, false);
    if (typeof (cordova) == "undefined") {
    	//we are not in a cordova app, start init method
    	console.log("Cordova is not available!");
    	
    	//wait for sapui5 to load, then start our init method
    	var that = this;
    	
    	 setTimeout(function () {
        that.init();
    }, 1000);
    	
    }

//Global Variables
var applicationContext = null; //applicationContext will be returned by logon operation  

var context = {}; //application context used as input for logonplugin

    context.appConfig = {};
    context.appConfig.appID = appId;
    context.appConfig.isForSMP = true;
    context.appConfig.certificate = customCertificateProvider;
    context.operation = {};

    var appDelegate = (function () {
        //contains callback methods (onRegistrationSuccess, onRegistrationError), will be called after logon completes

        return {
            onRegistrationSuccess: function (result) {
                console.log("Successfully Registered");
                applicationContext = result;
                startApp();
                logonSuccessCallback(result);
            },
            onRegistrationError: function (error) {
                console.log("An error occurred:  " + JSON.stringify(error));
                startApp();
                logonErrorCallback(error);
            }
        }
    }());

    //initial connection context
    context.smpConfig = {
        "serverHost": serverHost, //SMP3 or HCPms server address
        "https": serverProtocolIsHttp,
        "serverPort": serverPort,
        "communicatorId": "REST"
    };
    
    /**
     * Set Header for AJAX requests, e.g. X-SMP-APPCID.
     * 
     */
function setHeader(appcid, user, password) {    
    
    $.ajaxPrefilter(function( options, originalOptions, jqXHR ) {
        
        options.crossDomain = true;
       // jqXHR.setRequestHeader("X-SUP-SC", context.securityConfig);
       // jqXHR.setRequestHeader("X-SUP-DOMAIN", context.domain);
        // jqXHR.setRequestHeader("X-SUP-APPCID", appcid);

        if (appcid) {
            jqXHR.setRequestHeader("X-SMP-APPCID", appcid);
        }
        if (user && password) {
            jqXHR.setRequestHeader("Authorization", "Basic " + btoa(user + ":" + password));
        }      
        }); 
}
/**
 * Will return the connection url, e.g. http://smpServer:8080/ (with ending slash!)
 * 
 * @param appContextReturnedByLogonPlugin
 * @returns {String}
 */
function getConnectionURL(appContextReturnedByLogonPlugin) {
    var context = appContextReturnedByLogonPlugin.registrationContext;
    var scheme = context.https ? "https" : "http";
    var host = context.serverHost + ":" + context.serverPort;
    var resourcePath = (context.resourcePath.length > 0) ? (context.resourcePath + "/") : "/";
    var farmPath = (context.farmId.length > 1) ? (context.farmId + "/") : ""; //greater than 1 because the default value is "0"
    //return scheme + "://" + host + resourcePath + farmPath + "odata/applications/v1/" + sap.Logon.applicationId + "/Connections('" + info.applicationConnectionId + "')";
   return scheme + "://" + host + resourcePath + farmPath;
}
/**
 * Checks if a given string is contained in another string
 * e.g. containsString("Hallo this is a test", "test") will return true
 * 
 * @param stringValue the whole string that should be checked
 * @param containValue the value that should be found inside the other string
 */
function containsString(stringValue, containValue) {
    
    //-1 means it is not contained, otherwise the position where the string is contained is returned by method indexOf
    return (stringValue.indexOf(containValue) > -1);
    
}
/**
 *  Will be called if an scripting error appears. Shows an alert with more information.
 *  
 * @param msg
 * @param url
 * @param line
 * @returns {Boolean}
 */
function onError(msg, url, line) {
    var idx = url.lastIndexOf("/"), file = "unknown";
    if (idx > -1) {
        file = url.substring(idx + 1);
    }
    
    //ignore the following errors...
    if (containsString(msg, "offsetWidth")) {
    //Message is e.g. shown on Chromium/Android browser    
        return false;
    }
    console.log("An error occurred in " + file + " (at line # " + line + "): " + msg);
    
    return false; //suppressErrorAlert;
}

window.onerror = onError;
/**
 * Will be called if an error occured, when calling the plugins
 * @param error
 */
function logonErrorCallback(error) {   //this method is called if the user cancels the registration.
    console.log("An error occurred:  " + JSON.stringify(error));

        showInformationMessageBox("Registration Error\n" + JSON.stringify(error));
    
}
/**
 * Will be called after the Kapsel Logon Plugin finished. 
 * Here you should call a local method to set SMP required headers (e.g. X-SMP-APPCID).
 * @param result contains the application/registration context as JSON object
 */ 
function logonSuccessCallback(result) {
    console.log("logonSuccessCallback " + JSON.stringify(result));
    applicationContext = result;
    
    setHeader(applicationContext.applicationConnectionId, applicationContext.registrationContext.user, applicationContext.registrationContext.password);

    if (taResponse) {
        taResponse.setValue("Logon Success\n" + "Context:\n" + JSON.stringify(result));
    }

   // startApp();
}


/**
 * Will be called by Cordova, if Event deviceready is thrown.
 * 
 */  
function init() {
    console.log("Init is called. DeviceReady got thrown...");
    if ((typeof (sap) != "undefined") && (typeof(sap.Logger) != "undefined")) {
        sap.Logger.setLogLevel(sap.Logger.DEBUG);  //enables the display of debug log messages from the Kapsel plugins.
        sap.Logger.debug("SMPHelper: Log level set to DEBUG");
    }
    
    //Call the Logon Plugin if available
if ((typeof (sap) != "undefined") && (typeof (sap.Logon) != "undefined")) {

        context.operation.logonView = sap.logon.IabUi; //set logonView here, because here we can be sure, that "sap" is available

        sap.Logon.startLogonInit(context, appDelegate); //new logon method (instead if sap.Logon.init

} else {
        startApp();
    	showInformationMessageBox("Logon Plugin not available");
    }
}
/**
 * Callback method, called when unregistration was successful...
 * 
 * @param result
 */
function logonUnregisterSuccessCallback(result) {
    console.log("Successfully Unregistered");
    applicationContext = null;
    showInformationMessageBox("Successfully Unregistered");
       
}
/**
 * Unregister the app. Trigger a DELETE request to SMP to unregister the application connection id.
 */
function unregister() {

    try {
        //go back to page 1
        app.to("page1");

        if (applicationContext == null) {
            showInformationMessageBox("AppContext is null. Not Registered with SMP");
            return;
        }
        if (sap.Logon) {
            sap.Logon.core.deleteRegistration(logonUnregisterSuccessCallback, logonErrorCallback);
        } 

    } catch (exception) {

    }

}
/**
*
* Show an information messagebox 
*/
function showInformationMessageBox(content) {

    try {
  
        if ((typeof (sap) != "undefined") && (typeof (sap.m) != "undefined") && (typeof (sap.m.MessageBox) != "undefined")) {
            console.log("Message: " + content);
            sap.m.MessageBox.show(
            content, {
                icon: sap.m.MessageBox.Icon.INFORMATION,
                title: "Information",
                actions: [sap.m.MessageBox.Action.YES],
                onClose: function (oAction) { / * do something * / }
            }
          );
        } else {
            console.log("Message: " + content);
        }

    } catch (exception) {
        //e.g. thrown when runnin on Windows
        console.log("Exception when showing MessageBox: " + exception);

        if (taResponse) {
            taResponse.setValue(content);
        }

    }
}

