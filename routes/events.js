const express       = require('express')
const router        = express.Router()
const QRCode        = require('qrcode')
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
			.returning('event_id')
		.then(([eventId]) => {
			let qrObj = {
				eventId
			}

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
		.catch(e => res.send(e))
	} else {
		console.log("DOWN HERE")
		res.sendStatus(404)
	}
})

module.exports = router