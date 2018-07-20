const express = require('express')
const router  = express.Router()
const environment = process.env.NODE_ENV || 'development'
const configuration = require('../knexfile')[environment]
const knex = require('knex')(configuration); 

router.get('/', async (req, res) => {
	try {
		const events = await knex.select('*').from('events')
		res.send(events)
	} catch (e) {
		res.send(e)
	}
})

router.post('/:eventId/addAttendee', (req, res) => {
	//res.send("YOU ARE AT THE RIGHT PLACE TO ADD AN ATTENDEE")
	console.log(req.body)
	knex('attendees')
		.insert([{
			attendee_full_name: req.body.fullName,
			attendee_email: req.body.email,
			job_title_or_occupation: req.body.jobOrOccupation,
			company_name: req.body.companyName,
			website_or_portfolio_link: req.body.websiteOrPortfolio,
			linkedin: req.body.linkedin,
			event_attended_id: req.params.eventId
		}])
	.then(() => res.status(201).send("Attendee added. Time to redirect."))
	.catch(e => res.status(404).send(e))
})

router.get('/:eventId/listAttendees', (req, res) => {
	knex
		.select('*')
		.from('attendees')
		.where({
			event_attended_id: req.params.eventId
		})
	.then(attendees => res.send(attendees))
	.catch(e => res.status(404).send(e))
})

module.exports = router