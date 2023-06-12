const { v4: nanoid } = require('uuid')

class Booking {
   constructor(name = '', email = '', checkIn = new Date(), checkOut = new Date(), discount = 0) {
      this.id = nanoid()
      this.name = typeof name === 'string' ? name : ''
      this.email = typeof email === 'string' ? email : ''
      this.checkIn = checkIn instanceof Date ? checkIn : new Date()
      this.checkOut = checkOut instanceof Date ? checkOut : new Date()
      this.discount = typeof discount !== 'number' ? 0 : discount > 100 ? 100 : discount < 0 ? 0 : parseInt(discount, 10) || 0
      this.room = null
   }
   get fee() {
      if (!this.room) throw "booking is not assigned to any room, please add it to a room"
      return this.room.price * (100 - this.room.discount) * (100 - this.discount)
   }
}

class Room1 {
   constructor(name, price, discount) {
      this.name = name
      this.price = price
      this.discount = discount
   }
}

class Room2 {
   constructor({ name, price, discount }) {
      this.name = name
      this.price = price
      this.discount = discount
   }
}

class Room {
   constructor(name = '', price = 0, discount = 0) {
      this.id = nanoid()
      this.name = typeof name === 'string' ? name : ''
      this.price = typeof price !== 'number' ? 0 : price < 0 ? 0 : parseInt(price, 10) || 0
      this.discount = typeof discount !== 'number' ? 0 : discount > 100 ? 100 : discount < 0 ? 0 : parseInt(discount, 10) || 0
      this.bookings = []
   }
   addBooking(bookings) {
      if (Array.isArray(bookings)) {
         this.bookings.push(...bookings.map(booking => ({ ...booking, room: this })))
      } else {
         this.bookings.push({ ...bookings, room: this })
      }
      return this.bookings
   }
   removeBooking(identifier) {
      if (typeof identifier === 'number') {
         this.bookings.splice(identifier, 1)
      } else if (typeof identifier === 'string') {
         const index = this.bookings.findIndex(booking => booking.id === identifier)
         this.bookings.splice(index, 1)
      } else throw `wrong identifier to remove a booking, use index or id instead of ${identifier}`
   }

   isOccupied(date = new Date()) {
      for (const booking of this.bookings) {
         if (date >= booking.checkIn && date <= booking.checkOut) return true
      }
      return false
   }

   #getNumberOfDays(startDate, endDate) {
      const day = 24 * 60 * 60 * 1000
      const days = Math.round(Math.abs((startDate - endDate) / day))
      return days + 1
   }
   #convertDateIntoUtc00Date(date) {
      return new Date(date.toISOString().slice(0, 9))
   }

   occupancyPercentage(startDate, endDate = new Date()) {
      const startDay = this.#convertDateIntoUtc00Date(startDate)
      const endDay = this.#convertDateIntoUtc00Date(endDate)
      const numberOfDays = this.#getNumberOfDays(startDay, endDay)
      console.log(numberOfDays)
   }

   // static totalOccupancyPercentage(rooms, startDate, endDate = new Date()) {

   // }
   // static availableRooms(rooms, startDate, endDate = new Date()) {

   // }
}


module.exports = { Room, Booking }