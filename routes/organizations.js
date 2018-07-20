const express = require('express')
const router  = express.Router()
const bcrypt = require('bcrypt')
const environment = process.env.NODE_ENV || 'development'
const configuration = require('../knexfile')[environment]
const knex = require('knex')(configuration); 

router.get('/', (req, res) => {
	res.send('YOU ARE RIGHT HERE, organization.')
})

router.post('/register', (req, res) => {
	console.log(req.body)
	const password_hash = bcrypt.hashSync(req.body.ownerPassword, 10)
	knex('organizations')
		.insert([{
			org_name: req.body.organizationName,
			org_account_owner_name: req.body.accountOwnerName,
			org_owner_email: req.body.ownerEmail,
			password_hash
		}])
	.then(response => {
		//set session here
		knex
			.select('org_id')
			.from('organizations')
			.where({
				org_owner_email: req.body.ownerEmail
			})
		.then(([response]) => {
			req.session.userId = response.org_id
			req.session.userEmail = req.body.ownerEmail
			req.session.ownerName = req.body.accountOwnerName
			req.session.orgName = req.body.organizationName
			res.send(req.session)
		})
	})
	.catch(e => console.log("error", e))
})

router.post('/login', (req, res) => {
	if(req.session.userId) {
		res.send({
			status: 201,
			message: "Session exists, time to redirect."
		})
	} else {
		console.log(req.body)
		knex
			.select('*')
			.from('organizations')
			.where({
				org_owner_email: req.body.ownerEmail
			})
		.then(([organization]) => {
			bcrypt.compare(req.body.ownerPassword, organization.password_hash)
				.then(passMatch => {
					if (passMatch === true) {
						//set session here
						req.session.userId = organization.org_id
						req.session.ownerEmail = organization.org_owner_email
						req.session.ownerName = organization.org_account_owner_name
						req.session.orgName = organization.org_name
						console.log("SESSION SET", req.session)
						res.send(req.session)
					} else {
						res.sendStatus(404)
					}
					console.log("AFTERRR", req.session)
				})
		})
		.catch(e => console.log("error", e))
	}
})

router.get('/logout', (req, res) => {
	req.session = null
	console.log("logged out.")
	res.status(200).send("Logged Out.")
})

module.exports = router