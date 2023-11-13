var scope = window;
scope.scope = scope;
scope.Gwindow = document.getElementById("maingameframe").contentWindow;
scope.Gdocument = document.getElementById("maingameframe").contentDocument;
Gwindow.Gwindow = window;
Gwindow.Gdocument = document;

scope.mapid = 60;
scope.lowestmapid = mapid;
scope.stop = false;
if(typeof(scope.ogxmlopen)=="undefined"){
    scope.ogxmlopen = Gwindow.XMLHttpRequest.prototype.open;
}
if(typeof(scope.ogxmlsend)=="undefined"){
    scope.ogxmlsend = Gwindow.XMLHttpRequest.prototype.send;
}

Gwindow.XMLHttpRequest.prototype.open = function(_, url) {
    if(url.includes("map_fave.php")){
        this.favedMap = true;
    }
    ogxmlopen.call(this, ...arguments);
};


scope.startFaving = function(n){
    if(n<=0 || stop){return;}
    setTimeout(function(){
        chat2("/fav");
        startFaving(n-1);
    });
}

Gwindow.XMLHttpRequest.prototype.send = function(data) {
    if(this.favedMap){
        var id = data.match(/&mapid=[0-9]*&/)[0];
        data = data.replace(id,"&mapid="+mapid+"&");
        this.mapid = mapid;
        mapid++;
        this.onreadystatechange = function(){
            if(this.readyState == 4){
                var jsonresponse = JSON.parse(this.responseText);
                if(jsonresponse["e"] != "ratelimited"){
                    if(this.mapid>lowestmapid){
                        lowestmapid = this.mapid;
                    }
                }
                else{
                    stop = true;
                }
            }
        }
    }
    ogxmlsend.call(this, ...arguments);
};