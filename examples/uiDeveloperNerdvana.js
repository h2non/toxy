var toxy = require('toxy');
var express = require('express');
var poisons = toxy.poisons;
var rules = toxy.rules;

// Create a new toxy proxy
var proxy = toxy();
//var Array = require('Array');

/**********

  You probably want to change the dirs, apiRoots and host line.

*************/

let rootPath = __dirname; // start with local directory

var defaultBackend = 'yourbackendhost.com';
var apiRoots = ['/api','/login']; // URLs beginning with this are intercepted and routed to your backend.
var staticDirs = [rootPath, rootPath+ '/dist', rootPath+ '/build']; //
var host = process.env.HOST || defaultBackend;
var poisonrate = process.env.POISONRATE || 0;
var maxlatency = process.env.MAXLATENCY || 0;
var minlatency = process.env.MINLATENCY || maxlatency/2;
var throttle = process.env.THROTTLE || 0;


var app = express(),
port = process.env.PORT || 8000;

function processRequest(req,res,next) {
	    console.log(">>>>"+req.url);
	    next();
}

function applyPoisons(route)
{
	if (poisonrate > 0)
	{
	route.poison(poisons.inject({
	  code: 503,
	  body: '{"error": "toxy injected error"}',
	  headers: {'Content-Type': 'application/json'}
	}))
  .withRule(rules.probability(poisonrate));
   }
   if (maxlatency > 0)
   {
   	route.poison(poisons.latency({max:maxlatency, min: minlatency})).withRule(rules.method('GET'));
   }
   if (throttle > 0)
   {
   	route.poison(poisons.bandwidth({bps: throttle})).withRule(rules.method('GET'));
   }

}

function processResponse(req,res,next) {
	    console.log("<<<<<"+req.url);
	var keys = Object.keys(res._headers),
		len = keys.length,
		prop,
		value;
		for (i=0; false && i < len;i++)
		{
			prop = keys[i];
			value = res._headers[prop];
			//console.log("replacing",prop,value);

			/****
			  Most backend hosts give you a cookie that only works with their domain, by setting
			  Secure on the cookie.
			***/
			if (Array.isArray(value))
			{
				for (jx=0; jx < value.length; jx++)
				{
					v2 = value[jx];
					value[jx] = v2.replace(/Secure/g,'');
				}
			}
			else
			{
				value.replace(/Secure/g,'');
				res._headers[prop]=value;
			}
		}

        //res.connection.uncork() // needed to make rocky/toxy work with node 4.x
        next()
}

// Default server to forward incoming traffic
/*** Change https to http if your API server isn't https****/
proxy
  .forward('https://'+host)


for (var ix=0;ix< apiRoots.length;ix++)
{
var root = apiRoots[ix]+'/*';
	console.log('proxying',root);
	route=proxy
	  .all(root)
	  .withRule(rules.method(['POST', 'PUT', 'DELETE','GET']))
	  .options({ secure: false })
	.use(processRequest)
	.transformResponseBody(processResponse)
	  .host(host);
	  applyPoisons(route);
}


// Enable the admin HTTP server
var admin = toxy.admin({ cors: true })

// Add the toxy proxy instance
admin.manage(proxy)

admin.listen(9000)
console.log('Admin server listening on port:', 9000)

for (var dx=0; dx< staticDirs.length; dx++)
{
  console.log("Serving static content from ", staticDirs[dx])
  app.use(express.static(staticDirs[dx]));
}
app.use(proxy.middleware())
app.listen(port);

console.log("Environment Variables/Parameters are:");
console.log("HOST=",host);
console.log("PORT=",port);
if (poisonrate > 0)
	console.log("POISONRATE=",poisonrate," % of time to reply with 5xx instead of data");
else
	console.log("POISONRATE= 0");
	console.log("      no poisoning of requests");

if (maxlatency > 0)
{
	console.log("MAXLATENCY=",maxlatency, ' milliseconds');
	console.log("MINLATENCY=",minlatency, ' milliseconds');
}
else
{
	console.log("MAXLATENCY=",maxlatency);
	console.log("     NOT adding latency set at least MAXLATENCY to enable");

}

if (throttle > 0)
{
	console.log('THROTTLE=', throttle, ' bps');
}
else
{
	console.log('THROTTLE=0 bps');
	console.log('     no throttling will be performed');
}

console.log('Test it:', 'http://localhost:'+port+'/index.html')
