const express       = require('express')
const bodyParser    = require('body-parser')
const cookieSession = require('cookie-session')
const cors          = require('cors')
const PORT          = process.env.PORT || 4036
const app           = express()

app.use(cors({
	origin: ['http://localhost:8080', 'https://qard-web.firebaseapp.com'],
  credentials: true
}))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cookieSession({
  name: 'session',
  keys: ['I dont know.', 'Just work so that I can be done with this.', 'Please.']
}))

const organizations = require('./routes/organizations')
const events = require('./routes/events')
const attendees = require('./routes/attendees')

app.use('/organizations', organizations)
app.use('/events', events)
app.use('/attendees', attendees)

app.get('/', (req, res) => {
	res.send("Hey, dex guff here! I love having your ears on my mouth!")
})

app.listen(PORT, () => console.log(`Listening on localhost:${PORT}`))