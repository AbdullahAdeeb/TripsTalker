//////////////////////////////////////////////////
//               NAV
//////////////////////////////////////////////////
var nav = {
    slideDown: function(page,track){
        $.mobile.pageContainer.pagecontainer('change', '#'+page, {
            transition: 'slidedown',
            changeHash: track,
            reverse: false,
            showLoadMsg: true
        });
    },

    slideUp: function(page,track){
        $.mobile.pageContainer.pagecontainer('change', '#'+page, {
            transition: 'slidedown',
            changeHash: track,
            reverse: true,
            showLoadMsg: true
        });
    },

    flow: function(page,reverse){
        $.mobile.pageContainer.pagecontainer('change', '#'+page, {
            transition: 'flow',
            changeHash: false,
            reverse: reverse,
            showLoadMsg: true
        });
    },

    goTo: function(page,track){
        if(app.activePage == page){
            return;
        }
        $.mobile.pageContainer.pagecontainer('change', '#'+page, {changeHash: track});
    },

    flipPage: function(page,track){
        $.mobile.pageContainer.pagecontainer('change', '#'+page, {
            transition: 'flip',
            changeHash: track,
            reverse: true,
            showLoadMsg: true
        });
    },

    flipPageOnCount: function(page,track){
        if(currentCount < triggerCount)return;
        nav.flipPage(page,track);
    },

    onBackButton: function(){
        if(app.activePage == "event_page"){
            nav.flow("events_page",true);
            
        }else if(app.activePage == "events_page" ){
            navigator.app.exitApp();

        }else if(app.activePage == "newevent_page"){
            nav.slideUp("events_page",false);
        }else if(app.activePage == "login_page"){
            // do nothing
            navigator.app.exitApp();
            // TODO: exit on double tab
        }else if(app.activePage == "reset_page" || app.activePage == "register_page"){
            nav.slideUp("login_page",false);
        }else{
            nav.goTo("events_page",false);
        }
    },

    popError: function(message){
        $("#error-dialog-content").html(message);
        $('#errorpop').popup();
        $('#errorpop').popup('open', {transition: 'pop'});
    }        

}