const sqlite3 = require('sqlite3').verbose();
const Geodesy = require('geodesy')

exports.locstat_locate = function(request, response) {
    console.log(request.url)

    var url = require('url')
    //var name = url.parse(request.url,true).query['name']
    var id = parseInt(url.parse(request.url, true).query['id'])
    var mgrs = url.parse(request.url,true).query['mgrs']
    var lat = parseFloat(url.parse(request.url, true).query['lat'])
    var lon = parseFloat(url.parse(request.url, true).query['lon'])
    var time = parseInt(url.parse(request.url, true).query['time'])
		      

  if (isNaN(lat) || isNaN(lon)) {
	  if (typeof mgrs !== 'undefined') {
	    //var zone = mgrs.match(/\d+/i);
      var match = mgrs.match(/(^\d+)([A-Z])([A-Z])([A-Z])(\d{10})/)
      if (match == null)
      {
        console.log("Could not parse MGRS.  Returning 400");
        response.status('400').send("Check Variables");
        return;
      }
      var zone = match[1]
      var band = match[2]
      var e100k = match[3]
      var n100k = match[4]
      //if (Array.isArray(zone))
      //  zone = zone[0]
	    //var band = mgrs.charAt(2)
	    //var e100k = mgrs.charAt(3)
	    //var n100k = mgrs.charAt(4)
	    
	    var easting = parseInt(match[5].substring(0,5))
	    var northing = parseInt(match[5].substring(5))
      
      //check variables
      if (typeof zone == 'undefined' | zone == null | isNaN(zone)| parseInt(zone) > 100 | parseInt(zone) < 1 | typeof band == 'undefined' | band.length != 1	)
          {
            console.log("Could not parse MGRS.  Returning 400"); 
            response.status('400').send("Check Variables");
            return;
          }
	    var loc_mgrs = new Geodesy.Mgrs(zone,band,e100k,n100k,easting,northing)
	    var ll = loc_mgrs.toUtm().toLatLonE()
	    //console.log(ll.toString())
	    lat = ll.lat
	    lon = ll.lon
	    //console.log(lat + ", " + lon)
	  }
	  else {
	    response.end("Check variables")
	  }
  }

  console.log(lat + ", " + lon)
  let db = new sqlite3.Database('./41sigs.db',sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error(err.message);
    }


  })
  db.serialize(() => {
	  //var locupdate = db.prepare("UPDATE elementLocations SET lat = (?), lon = (?) where name = (?)",lat,lon,name)
	  var locinsert = db.prepare("INSERT into elementLocations (element_id, lat, lon, timestamp) VALUES (?,?,?,?)",id,lat,lon,time)
	  locinsert.run()
	  locinsert.finalize()
  })
  //db.each("SELECT * from elementLocations", function (err, row) {
	
	db.close()
	response.end("okay")
	//var ll = new Geodesy.LatLonEllipsoidal(lat,lon);
	//var utm = ll.toUtm();
	//var mgrs = utm.toMgrs()
	//console.log(mgrs.toString())
	//response.end(mgrs.toString())
  //})
}
exports.locstat_list = function(request, response) {
  console.log(request.url)

  let db = new sqlite3.Database('./41sigs.db',sqlite3.OPEN_READ, (err) => {
    if (err) {
      console.error(err.message);
    }
  })
  db.all("select elements.id, elements.name, elementLocations.lat, elementLocations.lon, MAX(elementLocations.timestamp) as timestamp from elements inner join elementLocations on elementLocations.element_id = elements.id WHERE elements.active=1 GROUP BY elements.id", function(err, rows) {
    //console.log(rows)
    response.end(JSON.stringify(rows))
    db.close()
    });
	}





