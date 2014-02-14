var host = "ws://" + window.location.hostname + ":8080";
var ws_status = new WebSocket(host+"/ws_status");
var ws_log = new WebSocket(host+"/ws_log");
var ws_ticks = null;
var snd = new Audio("assets/tock.wav");

var audio = 0;
var count_unit = "CPM";
var chart = null;
var points= [];
var gauge = null;

var jQT = new $.jQTouch({    // `new` keyword is optional.
    icon: 'jqtouch.png',
    statusBar: 'black-translucent',
    preloadImages: []
});




$(document).ready(function()
{

    if(!("WebSocket" in window))
    {
        //$('#chatLog, input, button, #examples').fadeOut("fast");
        $('<p>Oh no, you need a browser that supports WebSockets. How about <a href="http://www.google.com/chrome">Google Chrome</a>?</p>').appendTo('#container');
    }
    else
    {

        ws_status.onopen = function()
        {
            console.log('Status Update socket opened');
        };

        ws_status.onmessage = function(e)
        {
            x = JSON.parse(e.data);
           //console.log(x);
           switch(x.type)
           {
               case "status":
                    if(count_unit=="CPM") $('#act_count').html(parseInt(x.cpm));
                    if(count_unit=="CPS") $('#act_count').html(parseInt(x.cps));


                    // INES class identification
                    var doserate = parseFloat(x.doserate);

                    if(doserate < 0.1)
                    {
                        console.log("ebola");
                        // Level 0 Local Background
                        $('#radcon').html('0');
                        $('#radcon_name').html('LDR');
                        $('#eqd_unit').html('&micro;Sv/h');

                    }
                    else if (doserate < 10)
                    {
                        // Level 1 Anomaly
                        $('#radcon').html('1');
                        $('#radcon_name').html('Jet');
                        $('#eqd_unit').html('&micro;Sv/h');

                    }
                    else if (doserate < 1000)
                    {
                        // Level 2 Incident
                    }
                    else if (doserate < 100000)
                    {
                        // Level 3
                    }
                    else if (doserate < 1000000)
                    {
                        // Level 4
                    }
                    else if (doserate < 10000000)
                    {
                        // Level 5
                    }
                    else if (doserate < 100000000)
                    {
                        // Level 6
                    }
                    else
                    {
                        // Level 7
                    }

                    gauge.set(doserate);

                    $('#act_eqd').html(doserate.toFixed(2));
               break;

               default:

            }
        }

        ws_status.onclose = function()
        {
            console.log("Status socket closed");
        };

        ws_log.onmessage = function(e)
        {
          var x = JSON.parse(e.data);
          //console.log(x);
          switch(x.type)
          {
            case "history":
              console.log("HISTORY");

              $.each(x.log, function(i,v_json)
              {
                var v = JSON.parse(v_json);
                points.push({ "x": new Date(i*1000), "y": v.doserate});
              });

              chart = new CanvasJS.Chart("chartContainer",
              {
                animationEnabled: false,
                backgroundColor: "rgba(13,12,8,0.25)",
                title:{ text: "uSv/h", fontSize: 14, horizontalAlign: "right", fontColor: "rgba(117,137,12,0.8)", margin: 8 },
                axisY:{ minimum: 0, labelFontFamily: "Digi", gridThickness: 1, gridColor: "rgba(216,211,197,0.1)", lineThickness: 1, tickThickness: 0, interlacedColor: "rgba(216,211,197,0.05)"  },
                axisX:{ valueFormatString: "HH:mm", labelAngle: 0, labelFontFamily: "Digi", gridThickness: 1, gridColor: "rgba(216,211,197,0.1)", lineThickness: 1, tickThickness: 1 },
                data: [{ type: "column", color: "rgba(117,137,12,0.8)", dataPoints: points }]
              });

              chart.render();

            break;
            case "status":
              console.log("UPDATE")
              points.push({ "x": new Date(x.timestamp*1000), "y": x.doserate});

              while(points[0].x < new Date((x.timestamp-15*60)*1000))
              {
                points.shift();
              }

              chart.render();
            break;
            default:
          }
        }
    }

// Bind UI events

// CPS/CPM Toggle
$('#act_count').bind('click',function() {
    toggleCounter();
});

// Audio
    $('input[type="checkbox"]').bind('click',function() {
                        if($(this).is(':checked')) {



                           $('#audio-icon').html('<span class="glyphicon glyphicon-volume-up"></span>');
    $('#audio-status').html('<span class="ds-unit">ON</span>');
    audio=1;
    ws_ticks = new WebSocket(host+"/ws_ticks");
    ws_ticks.onmessage = function(e)
    {
        x = JSON.parse(e.data);
       //console.log(x);
       switch(x.type)
       {
           case "tick":
                if (audio == 1) snd.play();
                break;
           default:

        }
    }


                        }
                        else
                        {
              $('#audio-icon').html('<span class="glyphicon glyphicon-volume-off"></span>');
    $('#audio-status').html('<span class="ds-unit">OFF</span>');
    audio=0;
    ws_ticks.close();
                        }

                        });




});


function toggleCounter()
{
  if(count_unit=="CPM")
  {
     $('#count_unit').html('CPS');
     count_unit = "CPS";
  }
  else
  {
      $('#count_unit').html('CPM');
      count_unit = "CPM";

  }
}

   document.addEventListener("DOMContentLoaded", function() {

        var opts = {
          lines: 12, // The number of lines to draw
          angle: 0.15, // The length of each line
          lineWidth: 0.24, // The line thickness
          pointer: {
            length: 0.9, // The radius of the inner circle
            strokeWidth: 0.035 // The rotation offset
          },
          colorStart: '#6FADCF',   // Colors
          colorStop: '#8FC0DA',    // just experiment with them
          strokeColor: '#E0E0E0'   // to see which ones work best for you
        };
        var target = document.getElementById('gauge1'); // your canvas element
        gauge = new Gauge(target).setOptions(opts); // create sexy gauge!

        //gauge.setTextField(document.getElementById("output"));
        gauge.maxValue = 1; // set max gauge value
        gauge.animationSpeed = 64; // set animation speed (32 is default value)
        gauge.set(0);
    })
