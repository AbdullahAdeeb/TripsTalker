/////////////////////////////////////////////////
////          Push Notification
////////////////////////////////////////////////
var push = {
    init: function(){
        console.log('push>> init');
        if(pushNotification == undefined){
            console.log("pushNotification is underfined: something is wrong with the plugin");
            return;
        }
        if (device.platform == 'android' || device.platform == 'Android'){
            pushNotification.register(
                push.successHandler,
                push.errorHandler,
                {"senderID":"557660622898",  // project ID from google api dashboard
                 "ecb":"onNotification"}
            );
//        } else if ( device.platform == 'blackberry10'){
//            pushNotification.register(
//              push.successHandler,
//              push.errorHandler,
//              {invokeTargetId : "replace_with_invoke_target_id",
//              appId: "replace_with_app_id",
//              ppgUrl:"replace_with_ppg_url", //remove for BES pushes
//              ecb: "onNotificationBB",
//              simChangeCallback: replace_with_simChange_callback,
//              pushTransportReadyCallback: replace_with_pushTransportReady_callback,
//              launchApplicationOnPush: true
//              });
        } else if(device.platform == 'iOS'){
            pushNotification.register(
                tokenHandler,
                push.errorHandler,
                {
                    "badge":"true",
                    "sound":"true",
                    "alert":"true",
                    "ecb":"onNotificationAPN"
                });
        }else if(device.platform == 'browser'){
            console.log("browser has no push settings");
        }
    },
    successHandler: function(result){
        console.log('push:successHandle result= '+result);
    },
    errorHandler : function(error){
        console.log('push:errorHandler result= '+error);
    },
    tokenHandler: function (result) {
        // Your iOS push server needs to know the token before it can push to this device
        // here is where you might want to send it the token for later use.
        alert('device token = ' + result);
    }
}


// Android and Amazon Fire OS
function onNotification(e) {
    //    $("#app-status-ul").append('<li>EVENT -> RECEIVED:' + e.event + '</li>');
    console.log('event= '+e.event);
    switch( e.event )
    {
        case 'registered':
            if ( e.regid.length > 0 ){
                console.log("regID = " + e.regid+"user ID = "+session.data.id);
                socket.registerSNS(e.regid,session.data.id);
            }
            break;

        case 'message':
            // if this flag is set, this notification happened while we were in the foreground.
            // you might want to play a sound to get the user's attention, throw up a dialog, etc.
            if ( e.foreground )
            {
                //            $("#app-status-ul").append('<li>--INLINE NOTIFICATION--' + '</li>');
                // on Android soundname is outside the payload.
                // On Amazon FireOS all custom attributes are contained within payload
                //            var soundfile = e.soundname || e.payload.sound;
                // if the notification contains a soundname, play it.
                //            var my_media = new Media("/android_asset/www/"+ soundfile);
                //            my_media.play();
            }
            else
            {  // otherwise we were launched because the user touched a notification in the notification tray.
                if ( e.coldstart )
                {
                    //                $("#app-status-ul").append('<li>--COLDSTART NOTIFICATION--' + '</li>');
                }
                else
                {
                    //                $("#app-status-ul").append('<li>--BACKGROUND NOTIFICATION--' + '</li>');
                }
            }

            //       $("#app-status-ul").append('<li>MESSAGE -> MSG: ' + e.payload.message + '</li>');
            //           //Only works for GCM
            //       $("#app-status-ul").append('<li>MESSAGE -> MSGCNT: ' + e.payload.msgcnt + '</li>');
            //       //Only works on Amazon Fire OS
            //       $status.append('<li>MESSAGE -> TIME: ' + e.payload.timeStamp + '</li>');
            break;

        case 'error':
            //        $("#app-status-ul").append('<li>ERROR -> MSG:' + e.msg + '</li>');
            break;

        default:
            //        $("#app-status-ul").append('<li>EVENT -> Unknown, an event was received and we do not know what it is</li>');
            break;
    }
}

// BlackBerry10
function onNotificationBB(pushpayload) {
    var contentType = pushpayload.headers["Content-Type"],
        id = pushpayload.id,
        data = pushpayload.data;//blob

    // If an acknowledgement of the push is required (that is, the push was sent as a confirmed push
    // - which is equivalent terminology to the push being sent with application level reliability),
    // then you must either accept the push or reject the push
    if (pushpayload.isAcknowledgeRequired) {
        // In our sample, we always accept the push, but situations might arise where an application
        // might want to reject the push (for example, after looking at the headers that came with the push
        // or the data of the push, we might decide that the push received did not match what we expected
        // and so we might want to reject it)
        pushpayload.acknowledge(true);
    }
};

// iOS
function onNotificationAPN (event) {
    if ( event.alert )
    {
        navigator.notification.alert(event.alert);
    }

    if ( event.sound )
    {
        var snd = new Media(event.sound);
        snd.play();
    }

    if ( event.badge )
    {
        pushNotification.setApplicationIconBadgeNumber(successHandler, errorHandler, event.badge);
    }
}
