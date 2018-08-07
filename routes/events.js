const express       = require('express')
const router        = express.Router()
const QRCode        = require('qrcode')
const nodemailer    = require('nodemailer')
const environment   = process.env.NODE_ENV || 'development'
const configuration = require('../knexfile')[environment]
const knex          = require('knex')(configuration); 

router.get('/', (req, res) => {
	if (req.session.userId) {
		res.send("I see you have a session. Go right on through")
	} else {
		res.send("NONONONONONONONONONOO.")
	}
})

router.get('/all', (req, res) => {
	if (req.session.userId) {
		knex('events')
			.select('*')
			.where({
				event_owner_id: req.session.userId
			})
			.orderBy('event_date', 'desc')
		.then(response => console.log(response) || res.send(response))
	} else {
		console.log("DOWN HERE")
		res.sendStatus(404)
	}
})

router.get('/:eventId', (req, res) => {
	if (req.session.userId) {
		const {eventId} = req.params
		let qrObj = {
			eventId
		}

		knex('events')
			.select('event_name')
			.where({
				event_id: eventId
			})
		.then(([event]) => {
			console.log("is this name", event)
			qrObj.event_name = event.event_name

			QRCode.toDataURL(`https://qard-web.firebaseapp.com/#/attendees/${eventId}/addAttendee`)
				.then(qr => {
					qrObj.addAttendee = qr
				})
				.catch(err => console.error(err))

			QRCode.toDataURL(`https://qard-web.firebaseapp.com/#/attendees/${eventId}/listAttendees`)
				.then(qr => {
					qrObj.listAttendees = qr
					res.send(qrObj)
				})
				.catch(err => console.error(err))
		})
	} else {
		console.log("DOWN HERE")
		res.sendStatus(404)	
	}
})

//enter the event into the db and then select the event id from that newly created event
// 'http://somelinkhere.com/events/${event id selected}/addAttendee'
// 'http://somelinkhere.com/events/${event id selected}/listAttendees'
//use the links above in the toDataUrl method and convert those links to seperate qr codes
//send base64 string to front end and convert to image

router.post('/create', (req, res) => {
	if (req.session.userId) {
		console.log(req.body)
		knex('events')
			.insert([{
				event_name: req.body.eventName,
				event_date: req.body.eventDate,
				event_owner_id: req.session.userId
			}])
			.returning(['event_id', 'event_name'])
		.then(([info]) => {
			console.log("creating new events huh?", info)
			let qrObj = {
				event_id: info.event_id,
				event_name: info.event_name
			}

			QRCode.toDataURL(`https://qard-web.firebaseapp.com/#/attendees/${info.eventId}/addAttendee`)
				.then(qr => {
					qrObj.addAttendee = qr
				})
				.catch(err => console.error(err))

			QRCode.toDataURL(`https://qard-web.firebaseapp.com/#/attendees/${info.eventId}/listAttendees`)
				.then(qr => {
					qrObj.listAttendees = qr
					res.send(qrObj)
				})
				.catch(err => console.error(err))
		})
		.catch(e => res.send(e))
	} else {
		console.log("DOWN HERE")
		res.sendStatus(404)
	}
})

router.get('/email/:eventId', (req, res) => {
	if (req.session.userId) {
		knex('attendees')
			.select('attendee_email')
			.where({
				event_attended_id: req.params.eventId
			})
		.then(emails => {
			console.log(emails)

		  let transporter = nodemailer.createTransport({
	      service: 'gmail',
	      auth: {
	        user: process.env.EMAILID,
	        pass: process.env.EMAILPASS
	      }
	    })

	    emails.map(({attendee_email}) => {
	    	// setup email data with unicode symbols
			  let mailOptions = {
			    from: `${process.env.EMAILID}`, // sender address
			    to: `${attendee_email}`, // list of receivers
			    subject: 'List Of People Who Were At The Event You Attended. Qard.', // Subject line
			    text: `Hi,

			    	Here is the link that will show you who else attended the networking event that you were at. 

			    	https://qard-web.firebaseapp.com/#/attendees/${req.params.eventId}/listAttendees` // plain text body
			  }

			  // send mail with defined transport object
			  transporter.sendMail(mailOptions, (error, info) => {
			    if (error) {
			      return console.log(error);
			      const message = {
			        status: 400,
			        message: 'There seems to be an issue, try again later.'
			      }
			      res.send(message)
			    }

			    console.log('Message sent: %s', info.messageId)
			  })
	    })

  		const message = {
	      status: 200,
	      message: 'Email Sent.'
	    }
	    res.send(message)
		})
	} else {
		res.send({
			status: 401,
			message: 'You are not logged in.'
		})
	}
})

module.exports = router