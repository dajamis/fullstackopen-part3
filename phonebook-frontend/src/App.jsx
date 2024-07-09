import { useState, useEffect } from 'react'
import personService from './services/persons'

//### FILTER
const Filter = ({filterValue, handleFilter}) => {
  const handleChange = (event) => {
    handleFilter(event.target.value)
  }

  return (
    <div>
      <form>
        <div>
          filter shown with {' '}
          <input
            value={filterValue}
            onChange={handleChange}
          />
        </div>
      </form>
    </div>
  )
}

//### ADD PERSON
const AddPerson = ({persons, addPerson, changeNumber}) => {
  const [newName, setNewName] = useState('') //controlling the form input element for addPerson name.
  const [newNumber, setNewNumber] = useState('') //controlling the form input element for AddPerson number.
  
  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }
  
  const handleAdd = (event) => {
    event.preventDefault()
    const existingPerson = persons.find(person => person.name === newName)
    if (existingPerson) {
      if (window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
        const newPerson = {...existingPerson, number: newNumber}
        changeNumber(newPerson)
        setNewName('')
        setNewNumber('')
      }
    } else {
      const newPerson = { name: newName, number: newNumber }
      addPerson(newPerson)
      setNewName('')
      setNewNumber('')
    }
  }

  return (
    <form onSubmit = {handleAdd}>
    <div>
      name: <input 
      value = {newName}
      onChange={handleNameChange}
      />
    </div>
    <div>
      number:<input 
      value = {newNumber}
      onChange = {handleNumberChange}
      />
      </div>
    <div>
      <button type="submit">add</button>
    </div>
  </form>
  )
}

//DetailsPerson component: displays details for a single person in the phonebook
const DetailsPerson = ({person, removePerson}) => {
  return(
  <div key={person.id}>
  {person.name}{" "}
  {person.number}{" "}
  <button onClick={()=>removePerson(person.id)}>delete</button>
</div>
)} 

//DetailsList component: displays all people in the phonebook
const DetailsList = ({detailsList, removePerson}) => {
  return (
  <div>
    {detailsList.map((person) => (
      <DetailsPerson key = {person.name} person = {person} removePerson={removePerson}/>
    ))}
</div>
)}

//### ALERT NOTIFICATION component
const Notification = ({ message, className }) => {
  if (message === null) {
    return null
  }
  return (
    <div className={className}>
      {message}
    </div>
  )
}

//### APP COMPONENT: handles main function of the app and events and states
const App = () => {

  const [persons, setPersons] = useState([])
  const [filteredPersons, setFilteredPersons] = useState(persons)
  const [filterValue, setFilter] = useState('') //controlling the form input element for Filter.
  const [showAll, setShowAll] = useState(true)
  const [notificationMessage, setNotificationMessage] = useState(null)
  const [errorSuccess, setErrorSuccess] = useState(null)

  useEffect(() => {
    console.log('effect')
    personService
      .getAll()
      .then(initialPersons => {
        console.log('promise fulfilled')
        setPersons(initialPersons)
      })
  }, [])
  console.log('render', persons.length, 'persons')

  useEffect(() => {
    const filtered = filterValue === ''
      ? persons
      : persons.filter((person) =>
          person.name.toLowerCase().includes(filterValue.toLowerCase())
        )
    setFilteredPersons(filtered)
  }, [persons, filterValue])

  const handleFilter = (value) => {
    setFilter(value)
    setShowAll(value === '')
    const filtered = showAll ?
      persons
      : persons.filter(person => person.name.toLowerCase().includes(value.toLowerCase()))
    setFilteredPersons(filtered)
  }

  const addPerson = (newPerson) => {
    personService
      .create(newPerson)
      .then(returnedPerson => {
        const newPersons = persons.concat(returnedPerson)
        setPersons(newPersons)
        setNotificationMessage(`Added ${newPerson.name}`)
        setErrorSuccess('success')
        setTimeout(() => {
          setNotificationMessage(null)
          setErrorSuccess(null)
        }, 5000)
        handleFilter(filterValue)
      })
      .catch(error => {
        console.log(error.response.data.error)
        setNotificationMessage(error.response.data.error)
        setErrorSuccess('error')
        setTimeout(() => {
          setNotificationMessage(null)
          setErrorSuccess(null)
        }, 5000)
      })
  }

  const removePerson = (id) => {
    const person = persons.find(person => person.id === id)
    if (window.confirm(`Delete ${person.name}`)) {
      personService
        .remove(id)
        .then(() => {
          const newPersons = persons.filter(person => person.id !== id)
          setPersons(newPersons)
        })
    }
  };

  const changeNumber = (newPerson) => {
    personService
      .update(newPerson.id, newPerson)
      .then(returnedPerson => {
        setPersons(persons.map(n => n.id !== newPerson.id ? n : returnedPerson))
        setNotificationMessage(`Changed number for ${newPerson.name}`)
        setErrorSuccess('success')
        setTimeout(() => {
          setNotificationMessage(null)
          setErrorSuccess(null)
        }, 5000)
      })
      .catch(error => {
        setNotificationMessage(error.response.data.error)
        setErrorSuccess('error')
        setTimeout(() => {
          setNotificationMessage(null)
          setErrorSuccess(null)
        }, 5000)
      })
  }

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={notificationMessage} className = {errorSuccess}/>
      <Filter
      filterValue = {filterValue}
      handleFilter = {handleFilter}
      />
      <h2>add a new</h2>
      <AddPerson
      persons = {persons}
      addPerson = {addPerson}
      changeNumber = {changeNumber}
      />
      <h2>Numbers</h2>
      <DetailsList detailsList={showAll ? persons : filteredPersons}
      removePerson = {removePerson}
      />
    </div>
  )
}

export default App