
var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";
var ehrId="";

var map="";
var infowindow;
/**
 * Prijava v sistem z privzetim uporabnikom za predmet OIS in pridobitev
 * enolične ID številke za dostop do funkcionalnosti
 * @return enolični identifikator seje za dostop do funkcionalnosti
 */
function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}


/**
 * Generator podatkov za novega pacienta, ki bo uporabljal aplikacijo. Pri
 * generiranju podatkov je potrebno najprej kreirati novega pacienta z
 * določenimi osebnimi podatki (ime, priimek in datum rojstva) ter za njega
 * shraniti nekaj podatkov o vitalnih znakih.
 * @param stPacienta zaporedna številka pacienta (1, 2 ali 3)
 * @return ehrId generiranega pacienta
 */

$(function(){
    $("#demoChange").change(function(){
        $("#preberiEHRid").val($(this).val());
    });
});

function pridobiEhrId(){
    
    
    sessionId = getSessionId();
    
    ehrId = $("#preberiEHRid").val();
    console.log(ehrId);
    if(ehrId.length == 0 || ehrId.trim().length == 0){
        $("#vnos").fadeIn();
        $("#posredujSporocilo").find("span").html("Prosimo vnesite zahtevan podatek!");
        $("#posredujSporocilo").fadeIn();
    }
    
    else{
        $.ajax({
            url: baseUrl +"/demographics/ehr/"+ ehrId + "/party",
            type: 'GET',
            headers: { "Ehr-session":sessionId },
            success: function(data){
                $("#vnos").hide();
                $("#posredujSporocilo").hide();
                $("#podatki").fadeIn();
                var party = data.party;
                $("#tabela").html("<tr><th>Ime pacienta</th><th>Priimek pacienta</th><th>datum rojstva pacienta</th><tr><td>"
                +party.firstNames+"</td><td>"+party.lastNames+"</td><td>"+
                party.dateOfBirth+"</td></tr>");
            },
            error: function(err){
                $("#vnos").fadeIn();
                $("#posredujSporocilo").find("span").html("Napačni EHR Id");
                $("#posredujSporocilo").fadeIn();
                
            }
        });  
        
    }
}

function ponovniVnosEhrId(){
    $("#vnos").fadeIn();
    $("#podatki").hide();
}


function getMeritveDataKrvniTlak(){
    sessionId = getSessionId();

    var podatki = window.location.href.split('#');
    ehrId = podatki[1].trim();
    
    console.log(ehrId);
    
    Chart.defaults.global.responsive = false;
    var ctx = $("#myChart");
    var wlenght=0,dlenght=0;
    
    var tabCasov=[];
    var tabSistolicni=[];
    var tabDistolicni=[];
    var colorPink ="#F48FB1";
    
    $.ajax({
        url: baseUrl + "/view/" + ehrId + "/blood_pressure",
        type: 'GET',
        headers:{ "Ehr-session":sessionId },
        success: function(res){
            if(res.length > 0){
                var results = "<table class='uk-table uk-table-condensed uk-table-striped'>"+
                "<caption>Zadnjih deset meritev krvnega tlaka</caption>"+
                "<tr><th>ID na grafu</th><th>Datum in čas </th> <th> Sistolični </th>" +
                "<th>Diastolični</th> <th>Enote</th></tr>";
                for(var i in res){
                    
                    if(res[i].systolic > 140  || res[i].diastolic > 90 ){
                    results+="<tr class='uk-text-danger uk-text-bold'><td>"+i+"</td><td>"+res[i].time + "</td><td>"+res[i].systolic+"</td><td>"+
                    +res[i].diastolic + "</td><td>"+res[i].unit+"</td>";
                    dlenght++
                    }else if(res[i].systolic > 120  || res[i].diastolic > 80 ){
                    results+="<tr class='uk-text-warning'><td>"+i+"</td><td>"+res[i].time + "</td><td>"+res[i].systolic+"</td><td>"+
                    +res[i].diastolic + "</td><td>"+res[i].unit+"</td>";
                    wlenght++;
                    }else{
                    results+="<tr><td>"+i+"</td><td>"+res[i].time + "</td><td>"+res[i].systolic+"</td><td>"+
                    +res[i].diastolic + "</td><td>"+res[i].unit+"</td>";
                    }
                    tabCasov[i]=i
                    tabSistolicni[i] = res[i].systolic;
                    tabDistolicni[i] = res[i].diastolic;
                }
                results+="</table>";
                $("#vsebinaBlood").append(results);
            
                var myChart = new Chart(ctx,{
                    type: 'line',
                    data:{
            
                       // labels:["Red","Blue","Green","Purple"],
                        labels: tabCasov,
                        datasets: [{
                            label: 'Sistolični krvni tlak',
                            data: tabSistolicni,
                            backgroundColor: "rgba(129,212,250,0.5)",
                            
                        },{
                            label:"Meja zdravega Sistoličnega tlaka",
                            data:[120,120,120,120,120,120,120,120,120,120],
                            fill:false,
                            backgroundColor: "white",
                            borderColor: "#EF5350",
                            pointRadius: 0,
                            
                        }]
                    },
                    options:{
                        scales:{
                            yAxes:[{
                                ticks:{
                                    beginAtZero:true
                                }
                            }]
                        }
                    }
                });
                
                
                ctx = $("#myChart2");
               var myChart2 = new Chart(ctx,{
                    type: 'line',
                    data:{
            
                       // labels:["Red","Blue","Green","Purple"],
                        labels: tabCasov,
                        datasets: [{
                            label: 'Diastolični krvni tlak',
                            data: tabDistolicni,
                            backgroundColor: "rgba(197,202,233,0.5)",
                        },{
                            label:"Meja zdravega tlaka",
                            data:[80,80,80,80,80,80,80,80,80,80],
                            fill:false,
                            backgroundColor: "white",
                            borderColor: "#EF5350",
                            pointRadius: 0,
                            
                        }]
                    },
                    options:{
                        scales:{
                            yAxes:[{
                                ticks:{
                                    beginAtZero:true
                                }
                            }]
                        }
                    }
                });
                $("#informacijaOPacientu").html("Pacinetov krvni tlak je "+wlenght+" krat presegel varno vrednost, in "+dlenght+
                " krat presegel območje nevarnosti!");
            }
            
            
            
        }
    })
    
    
}
function getMeritveDataTemperatura(){
    sessionId = getSessionId();

    var podatki = window.location.href.split('#');
    ehrId = podatki[1].trim();
    
    Chart.defaults.global.responsive = false;
    var ctx = $("#temperaturaChart");
    
    var tabTemperatur = [];
    var tabCasov = [];
    var warm = 0;
    
    $.ajax({
        url: baseUrl + "/view/" + ehrId + "/body_temperature",
        type: 'GET',
        headers: {"Ehr-Session": sessionId },
        success: function(res){
            if(res.length > 0){
                var results = "<table class='uk-table uk-table-condensed uk-table-striped'>"+
                "<caption>Zadnjih deset meritev Temperature</caption>"+
                "<tr><th>ID na grafu</th><th>Datum in čas</th> <th> Telesna temperatura</th>" +
                "<th>Enote</th></tr>";
                 for(var i in res){
                    
                    if(res[i].temperature > 36){
                    results+="<tr class='uk-text-warning uk-text-bold'><td>"+i+"</td><td>"+res[i].time + "</td><td>"+res[i].temperature+"</td>"+
                    "<td>"+res[i].unit+"</td></tr>";
                    warm++;
                    }else{results+="<tr><td>"+i+"</td><td>"+res[i].time + "</td><td>"+res[i].temperature+"</td>"+
                    "<td>"+res[i].unit+"</td></tr>";
                    }
                    
                    tabTemperatur[i] = res[i].temperature;
                    tabCasov[i] = i;
                 }
                results+="</table>";
                $("#vsebinaTemperatura").append(results);
                
                var myChart = new Chart(ctx,{
                    type: 'line',
                    data:{
            
                        labels: tabCasov,
                        datasets: [{
                            label: 'Temperatura',
                            data: tabTemperatur,
                            backgroundColor: "rgba(129,212,250,0.5)",
                            
                        },{
                            label:"Meja normalne temperature",
                            data:[36,36,36,36,36,36,36,36,36,36],
                            fill:false,
                            backgroundColor: "white",
                            borderColor: "#EF5350",
                            pointRadius: 0,
                            
                        }]
                    },
                    options:{
                        scales:{
                            yAxes:[{
                                ticks:{
                                    beginAtZero:true
                                }
                            }]
                        }
                    }
                });
                 $("#informacijaOPacientu").html("Pacientova temperatura je "+warm+" krat presegla varno območje");
            }else{
                $("#vsebinaTemperatura").append("<div class='uk-alert uk-alert-warning'>Ni podatkov!</div>");
            }
        }
    });
}
function getMeritveDataTeza(){
    sessionId = getSessionId();
    
    var podatki = window.location.href.split('#');
    ehrId = podatki[1].trim();
    
    Chart.defaults.global.responsive = false;
    var ctx = $("#tezaChart");
    var tabTeze = [];
    var tabCasov=[];
    var pretezek=0;
    
    $.ajax({
       url: baseUrl + "/view/" + ehrId + "/weight",
       type: 'GET',
       headers: { "Ehr-Session": sessionId },
       success: function (res){
           if(res.length > 0){
               var results = "<table class='uk-table uk-table-condensed uk-table-striped'>"+
                "<caption>Zadnjih deset meritev Teže</caption>"+
                "<tr><th>ID na grafu</th><th>Datum in čas</th> <th> Telesna Teža</th>" +
                "<th>Enote</th></tr>";
                for(var i in res){
                    
                    if(res[i].weight > 90){
                    results+="<tr class='uk-text-warning uk-text-bold'><td>"+i+"</td><td>"+res[i].time + "</td><td>"+res[i].weight+"</td>"+
                    "<td>"+res[i].unit+"</td></tr>";
                    pretezek++;
                    }else{results+="<tr><td>"+i+"</td><td>"+res[i].time + "</td><td>"+res[i].weight+"</td>"+
                    "<td>"+res[i].unit+"</td></tr>";
                    }
                    
                    tabCasov[i] = i;
                    tabTeze[i] = res[i].weight;
                    
                
                   
                }
                results+="</table>";
                $("#vsebinaTeza").append(results);
                 
                 var myChart = new Chart(ctx,{
                    type: 'line',
                    data:{
            
                        labels: tabCasov,
                        datasets: [{
                            label: 'Teza',
                            data: tabTeze,
                            backgroundColor: "rgba(129,212,250,0.5)",
                            
                        },{
                            label:"Meja normalne teže",
                            data:[80,80,80,80,80,80,80,80,80,80],
                            fill:false,
                            backgroundColor: "white",
                            borderColor: "#EF5350",
                            pointRadius: 0,
                            
                        }]
                    },
                    options:{
                        scales:{
                            yAxes:[{
                                ticks:{
                                    beginAtZero:true
                                }
                            }]
                        }
                    }
                });
                $("#informacijaOPacientu").html("Pacientova teza je "+pretezek+" krat presegla varno območje");
           }
       }
    });
}

function blurElement(){
    $("#prikazPodatkov").foggy();
    $(".okvir").hide();
    $("#prikazMenija").fadeIn();
}

function noBlur(){
    $("#prikazMenija").hide();
    $(".okvir").fadeIn();
    $("#prikazPodatkov").foggy(false);
}


function preusmeritev(obj){
    var pot = $(obj).find("p").text();
    window.location.href=pot+'.html#'+ehrId;
    console.log(pot);
}

function backToMain(){
    window.location.href='index.html#'+ehrId;
}

function preveriZapisEhrId(){
   if(window.location.href.indexOf("#")>-1) {
       var podatki = window.location.href.split('#');
       console.log(podatki[1].trim());
       $("#preberiEHRid").val(podatki[1].trim());
           pridobiEhrId();
   }else{
        $("#vnos").fadeIn();
       }
}

function pridobiKontaktneInformacije(){
     $.ajax({
            url: baseUrl +"/demographics/ehr/"+ ehrId + "/party",
            type: 'GET',
            headers: { "Ehr-session":sessionId },
            success: function(data){
                var party = data.party;
                var parametri = [];
                for(var i=0; i<4;i++){
                    if(party.partyAdditionalInfo[i].key == "phoneNumber"){parametri[0] = party.partyAdditionalInfo[i].value}
                    if(party.partyAdditionalInfo[i].key == "address"){parametri[1] = party.partyAdditionalInfo[i].value}
                    if(party.partyAdditionalInfo[i].key == "eMail"){parametri[2] = party.partyAdditionalInfo[i].value}
                }
                console.log(party.partyAdditionalInfo[0].value + " " +party.partyAdditionalInfo[1].value+
                " " + party.partyAdditionalInfo[2].value);
                $("#vrniKontaktneInformacije").html("<dt>Ime in priimek:</dt><dd>"+party.firstNames +" "+ party.lastNames+"</dd>"+
                "<dt>Naslov bivališča:</dt><dd>"+parametri[0]+"</dd>"+
                "<dt>Telefonska Stevilka:</dt><dd>"+parametri[1]+"</dd>"+
                "<dt>E-Mail naslov:</dt><dd>"+parametri[2]+"</dd>");
            },
            error: function(err){
                $("#vrniKontaktneInformacije").html("<div class='uk-alert-danger'>Pozor podatki ne obstajajo</div>");
            }
        });
     
     if(map==""){
         vrniMap();
     }
  
}

function vrniMap(){
    var lj = new google.maps.LatLng(46.059902, 14.506352);
    var pyrmont = new google.maps.LatLng(19.107567, 72.8335);
      
    var mapDiv = document.getElementById('map');
    map = new google.maps.Map(mapDiv, {
      //center: {lat: 46.059902, lng: 14.506352},
      center: lj,
      zoom: 12
    });
    
    var marker = new google.maps.Marker({
      position: lj,
      title:"Hello World!",
      visible: true
    });
    marker.setMap(map);
    
    var request = {
    location: lj,
    radius: 3000,
    types: ['hospital'] // this is where you set the map to get the hospitals and health related places
    };
  
  infowindow = new google.maps.InfoWindow();
  var service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, callback);
  
}

function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      createMarker(results[i]);
      //console.log(results[i].geometry.location.lat());
      //console.log(results[i].geometry.location.lng());
    }
  }
}



function createMarker(place) {
  var placeLoc = place.geometry.location;
  //console.log(placeLoc);
  console.log(map);
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location,
    visible: true
  });
    console.log(map);
  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(place.name);
    infowindow.open(map, this);
  });
}




function generirajPosameznegaPacienta(st){
    var imeT = ["Zdravko","Random","Rudi"];
    var priimekT =["Zdravi","Povprečnez","Bolni"];
    var drojstvaT = "1990-12-11T18:48:37.005+01:04";
    var naslovT = ["Pod gor 12","V mesu 22","Zgornja Jama 69"];
    var telefonT = ["031 222 661","225 010 333","0010 1001 1010"];
    var eMailT = ["srecen.zdrav@mail.com","povprecni.bolnik@mail.com","binarna.uganka@ugani.si"];
    var tmp;
    
    sessionId = getSessionId();
    
    $.ajaxSetup({
        headers: {"Ehr-Session": sessionId }
    });
    
    
    var ime = imeT[st-1];
    var priimek = priimekT[st-1];
    var drojstva = drojstvaT[st-1];
    var naslov = naslovT[st-1];
    var telefon = telefonT[st-1];
    var eMail = eMailT[st-1];
    
    $.ajax({
        url: baseUrl + "/ehr",
        type: 'POST',
        success: function (data){
            tmp = data.ehrId;
            var partyData = {
                firstNames: ime,
                lastNames: priimek,
                dateOfBirth: drojstva,
                
               partyAdditionalInfo: [
                        {
                          key: "ehrId",
                          value:tmp,
                        },
                        {
                            key: "phoneNumber",
                            value: telefon,
                        },
                        {
                            key: "address",
                            value: naslov,
                        },
                        {
                            key: "eMail",
                            value: eMail,
                        }
                        ]
            }
            console.log(ehrId);
            $.ajax({
                    url: baseUrl + "/demographics/party",
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(partyData),
                    success: function(party){
                        if(party.action == 'CREATE'){
                            $("#generiraniPodatki").append("<div class='uk-alert'>"+tmp+"</div>");
                            console.log(tmp);
                            for(var i=0; i<30;i++){
                            vnosNovihvitalnihZnakov(st,tmp);
                            }
                        }
                        
                    }
                });
        }
    });
    
}

function vnosNovihvitalnihZnakov(st,ehr){
    SessionId = getSessionId();
    ehrId = ehr;
    
    var d = new Date();
    var casTreutni = [d.getHours(),d.getMinutes(),d.getSeconds()];
    
    var datum = "2014-12-11T"+casTreutni[0]+":"+casTreutni[1]+":"+casTreutni[2]+".005+01:00";
    var krvniSis;
    var krvniDis;
    var teza;
    var temperatura; 
    var merilec = "REKT";
    
    var zgornjeMejeSis = [92,105,115];
    var zgornjeMejeDis = [52,62,75];
    var zgornjeMejeTeza = [65,87,90];
    var zgornjeMejeTemperatura = [32,35,40];
    
    krvniSis = Math.floor((Math.random() * 30) + zgornjeMejeSis[st-1]);
    krvniDis = Math.floor((Math.random() * 30) + zgornjeMejeDis[st-1]);
    teza = Math.floor((Math.random() * 5) + zgornjeMejeTeza[st-1]);
    temperatura = Math.floor((Math.random() * 5) + zgornjeMejeTemperatura[st-1]);
    
    $.ajaxSetup({
        headers: {"Ehr-Session": sessionId }
    });
    
    var podatki = {
        "ctx/language": "en",
		"ctx/territory": "SI",
		"ctx/time": datum,
		"vital_signs/body_weight/any_event/body_weight": teza,
		"vital_signs/body_temperature/any_event/temperature|magnitude": temperatura,
		"vital_signs/body_temperature/any_event/temperature|unit": "°C",
		"vital_signs/blood_pressure/any_event/systolic": krvniSis,
		"vital_signs/blood_pressure/any_event/diastolic": krvniDis
    };
    
    var parametriZahteve = {
        ehrId: ehrId,
        templateId: 'Vital Signs',
        format: 'FLAT',
        commiter: merilec
    };
    
    $.ajax({
        url: baseUrl + "/composition?"+ $.param(parametriZahteve),
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(podatki),
        success: function(res){
            $("#spin").html("");
        }
    });   
}

function generiranjePodatkov(){
    $("#spin").append("<i class='uk-icon-spinner uk-icon-spin'></i>");
    generirajPosameznegaPacienta(1);
    generirajPosameznegaPacienta(2);
    generirajPosameznegaPacienta(3);
}


//http://www.healthline.com/health/high-blood-pressure-hypertension
// TODO: Tukaj implementirate funkcionalnost, ki jo podpira vaša aplikacija
