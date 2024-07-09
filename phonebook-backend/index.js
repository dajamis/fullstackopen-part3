require('dotenv').config()
const Person = require('./models/person')
const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')

app.use(express.static('dist'))
app.use(express.json())
app.use(cors())

morgan.token('body', (request) => {
  return request.method === 'POST' || request.method === 'PUT' ? JSON.stringify(request.body) : ''
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

//Get all entries from phonebook
app.get('/api/persons', (request, response, next) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
    .catch(error => next(error))
})

//Add person to phonebook
app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({ error: 'name or number missing' })}

  const person = new Person ({
    name: body.name,
    number: body.number
  })

  person.save()
    .then(savedPerson => {response.json(savedPerson)})
    .catch(error => next(error))
})

//Update person in the phonebook
app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(
    request.params.id,
    person,
    {
      new: true,
      runValidators: true,
      context: 'query'
    }
  )
    .then(updatedPerson => {
      if (updatedPerson) {
        response.json(updatedPerson)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

//Retrieve details for a person
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

// Delete person from phonebook
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})


//INFO PAGE: return information about the service
app.get('/info', (request, response, next) => {
  Person.countDocuments({})
    .then(count => {
      const time = new Date()
      response.send(`
        <p>Phonebook has info for ${count} people</p>
        <p>${time}</p>
      `)
    })
    .catch(error => next(error))
})

//Error handling middleware
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }  next(error)
}

app.use(errorHandler)

// const PORT = process.env.PORT || 3001
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

