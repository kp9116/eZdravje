
var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";
var ehrId="";

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
            }
            
            $("#informacijaOPacientu").html("Pacinetov krvni tlak je "+wlenght+" krat presegel varno vrednost, in "+dlenght+
            " krat presegel območje nevarnosti!");
            
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
                    
                    if(res[i].temperature > 90){
                    results+="<tr class='uk-text-warning uk-text-bold'><td>"+i+"</td><td>"+res[i].time + "</td><td>"+res[i].temperature+"</td>"+
                    "<td>"+res[i].unit+"</td></tr>";
                    pretezek++;
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
                    
                    pretezek++;
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
                            label: 'Sistolični krvni tlak',
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
           }
       }
    });
}

function getMeritveDataMedicine(){
    sessionId = getSessionId();

    var podatki = window.location.href.split('#');
    ehrId = podatki[1].trim();
    
    $.ajax({
        url: baseUrl + "/view/" + ehrId + "/medication",
        type: 'GET',
        headers: {
            "Ehr-Session": sessionId
        },
        success: function (res){
            if(res.length > 0){
               var results = "<table class='uk-table uk-table-condensed uk-table-striped'>"+
                "<caption>Vsa zdravila paicenta</caption>"+
                "<tr><th>ime zdravila</th><th>začetni datum jemanja zdravila</th> <th> Končni datum jemanja zdravila</th>" +
                "<th>Količina</th><th>Enote</th></tr>";
                for(var i in res){
                    var datumS = res[i].start_date.split('T');
                    var datumE = res[i].stop_date.split('T');
                    
                    results+="<tr><td>"+res[i].medicine+"</td><td>"+ datumS[0] +"</td><td>" + datumE[0] +
                    "</td><td>"+ res[i].quantity_amount +"</td><td>"+res[i].quantity_unit+"</td>";
                }
                results+="</table>";
                $("#vsebinaMedicine").append(results);
            }else{
                $.UIkit.modal('#novVnosMedicine').show();
                $("#sporociloMedicinePodatki").append("<p><div class='uk-alert uk-alert-warning'>"+
                "Pacient trenutno ne uporablja nobenih zdravil, prosimo vnesite novo zdravilo</div></p>");
                //vnosMedicine();
            }
        }
    })
}

function vnosMedicine(){
    sessionId = getSessionId();
    
    
    var d = new Date();
    var casTreutni = [d.getHours(),d.getMinutes(),d.getSeconds()];
    
    var datum = "2014-12-11T"+casTreutni[0]+":"+casTreutni[1]+":"+casTreutni[2]+".005+01:04";
    
    $.ajaxSetup({
        headers: {"Ehr-Session": sessionId }
    });
    
    var podatki = {
        "ctx/language": "en",
		"ctx/territory": "SI",
		"ctx/time": datum,
		"vital_signs/body_weight/any_event/body_weight": teza,
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
            $("#sporocilo2").html(ehrId);
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
     console.log(ehrId);
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
}
function generiranjePodatkov(){
    var imeT = ["Zdravko","Random","Rudi"];
    var priimekT =["Zdravi","Povprečnez","Bolni"];
    var drojstvaT = "1990-12-11T18:48:37.005+01:04";
    var naslovT = ["Pod gor 12","V mesu 22","Zgornja Jama 69"];
    var telefonT = ["031 222 661","225 010 333","0010 1001 1010"];
    var eMailT = ["srecen.zdrav@mail.com","povprecni.bolnik@mail.com","binarna.uganka@ugani.si"];
    //console.log(eMail[0]);
    
    sessionId = getSessionId();
    for(var i=0; i<3;i++){
    $.ajaxSetup({
        headers: {"Ehr-Session": sessionId }
    });
    
    
    var ime = imeT[i];
    var priimek = priimekT[i];
    var drojstva = drojstvaT[i];
    var naslov = naslovT[i];
    var telefon = telefonT[i];
    var eMail = eMailT[i];
    
    $.ajax({
        url: baseUrl + "/ehr",
        type: 'POST',
        success: function (data){
            ehrId = data.ehrId;
            console.log(ehrId);
            var partyData = {
                firstNames: ime,
                lastNames: priimek,
                dateOfBirth: drojstva,
                
               partyAdditionalInfo: [
                        {
                          key: "ehrId",
                          value:ehrId,
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
                            $("#generiraniPodatki").append("<div class='uk-alert'>"+ehrId+"</div>")
                        }
                    }
                });
        }
    });
    
        
    }
}
function vnosPodatkov(){
    var ime = $("#ime").val();
    var priimek = $("#priimek").val();
    var dRojstva = "0022-01-01T00:00:00.000Z";
    var naslov = $("#address").val();
    var telefon = $("#telefonskaStevilka").val();
    var eMail = $("#eMail").val();
    if(ime.length == 0 || priimek.length == 0){
        
    }
    else{
        sessionId = getSessionId();
        //console.log(ime+ priimek + dRojstva + naslov)
        $.ajaxSetup({
            headers: {"Ehr-Session": sessionId }
        });
        $.ajax({
            url: baseUrl + "/ehr",
            type : 'POST',
            success: function(data){
                ehrId = data.ehrId;
                var partyData = {
                    firstNames: ime,
                    lastNames: priimek,
                    dateOfBirth: dRojstva,
                    
                    partyAdditionalInfo: [
                        {
                          key: "ehrId",
                          value:ehrId,
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
                            value: eMail
                        }
                        ]
                };
                $.ajax({
                    url: baseUrl + "/demographics/party",
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(partyData),
                    success: function(party){
                        if(party.action == 'CREATE'){
                            $("#sporocilo").html(ehrId);
                        }
                    }
                });
            }
        });
    }
}

function vnosVitalnihZnakov(){
    sessionId = getSessionId();
    ehrId = $("#vitalniEhrId").val();
    //var datum = $("#casVnosa").val();
    var d = new Date();
    var casTreutni = [d.getHours(),d.getMinutes(),d.getSeconds()];
    
    var datum = "2014-12-11T"+casTreutni[0]+":"+casTreutni[1]+":"+casTreutni[2]+".005+01:04";
    console.log(datum);
    var krvniSis = $("#krvnitlakSistolični").val();
    var krvniDis = $("#krvnitlakDistolični").val();
    var teza = $("#teza").val();
    var temperatura = $("#temperatura").val();
    var merilec = "REKT";
    
    krvniSis = Math.floor((Math.random() * 30) + 100);
    krvniDis = Math.floor((Math.random() * 30) + 60);
    teza = Math.floor((Math.random() * 5) + 90);
    temperatura = Math.floor((Math.random() * 10) + 30) ;
    
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
            $("#sporocilo2").html(ehrId);
        }
    });
    
}
//http://www.healthline.com/health/high-blood-pressure-hypertension
// TODO: Tukaj implementirate funkcionalnost, ki jo podpira vaša aplikacija
