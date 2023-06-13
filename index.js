const { v4: nanoid } = require('uuid')

// this.name = typeof name === 'string' ? name : ''
// this.price = typeof price !== 'number' ? 0 : price < 0 ? 0 : parseInt(price, 10) || 0
// this.discount = typeof discount !== 'number' ? 0 : discount > 100 ? 100 : discount < 0 ? 0 : parseInt(discount, 10) || 0

// this.name = typeof name === 'string' ? name : ''
// this.email = typeof email === 'string' ? email : ''
// this.checkIn = checkIn instanceof Date ? checkIn : new Date()
// this.checkOut = checkOut instanceof Date ? checkOut : new Date()
// this.discount = typeof discount !== 'number' ? 0 : discount > 100 ? 100 : discount < 0 ? 0 : parseInt(discount, 10) || 0


class Booking {
   constructor({ name = '', email = '', checkIn = new Date(), checkOut = null, discount = 0 } = {}) {
      this.id = nanoid()
      this.name = name
      this.email = email
      this.checkIn = checkIn
      this.checkOut = checkOut
      this.discount = discount
      this.room = null
   }
   get fee() {
      if (!this.room) throw "booking is not assigned to any room, please add it to a room"
      return this.room.price * (100 - this.room.discount) * (100 - this.discount)
   }
   addRoom(room) {
      if (!(room instanceof Room)) throw `Provided room: ${room} is not an instance of Room class`
      room.addBooking(this)
      return this
   }
   removeRoom() {
      if (!this.room) throw 'There is no room inside Booking'
      this.room.removeBooking(this.id)
   }
}



class Room {
   constructor({ name = 'Room', price = 0, discount = 0 } = {}) {
      this.id = nanoid()
      this.name = name
      this.price = price
      this.discount = discount
      this.bookings = []
   }

   addBooking(booking) {
      if (!(booking instanceof Booking)) throw `Provided booking: ${booking} is not an instance of Booking class`
      booking.room = this
      this.bookings.push(booking)
      return this
   }

   addBookings(bookings) {
      if (!Array.isArray(bookings)) throw 'Bookings should be an array of Bookings'
      for (const booking of bookings) {
         if (!(booking instanceof Booking)) throw `Provided booking: ${booking} is not an instance of Booking class`
         booking.room = this
         this.bookings.push(booking)
      }
      return this
   }

   removeBooking(identifier) {
      if (typeof identifier === 'number') {
         const [removedBooking] = this.bookings.splice(identifier, 1)
         if (removedBooking) removedBooking.room = null
      } else if (typeof identifier === 'string') {
         const index = this.bookings.findIndex(booking => booking.id === identifier)
         if (index === -1) return this
         const [removedBooking] = this.bookings.splice(index, 1)
         if (removedBooking) removedBooking.room = null
      } else throw `wrong identifier to remove a booking, use index or id instead of ${identifier}`
      return this
   }


   static calculateStartAndEndDayAsInteger(startDate, endDate, timezoneOffsetInMinutes = 120) { // Spain = 120

      // if dates are already as integer day dates, skip and return those
      if (typeof startDate === 'number' && typeof endDate === 'number' && startDate < 100_000 && endDate < 100_000) {
         return [startDate, endDate]
      }

      const timezoneOffset = timezoneOffsetInMinutes * 60 * 1000

      // it returns the day number since 01-01-1970 as integer
      const getDayFromDate = (date) => {
         return Math.trunc((date.getTime() + timezoneOffset) / (24 * 60 * 60 * 1000))
      }

      const currentDate = new Date()

      const validStartDate = startDate instanceof Date ? startDate : currentDate
      const validEndDate = endDate instanceof Date ? endDate : startDate > currentDate ? startDate : currentDate

      const startIntegerDay = getDayFromDate(validStartDate)
      const endIntegerDay = getDayFromDate(validEndDate)

      return [startIntegerDay, endIntegerDay]
   }

   calculateOcupancyMap(startDayAsInteger, endDayAsInteger = startDayAsInteger) {
      const occupancyMap = {}

      for (const booking of this.bookings) {
         if (!booking.checkIn || !(booking.checkIn instanceof Date)) continue

         const [bookingStartDayAsInteger, bookingEndDayAsInteger] = Room.calculateStartAndEndDayAsInteger(booking.checkIn, booking.checkOut)

         if (bookingStartDayAsInteger > endDayAsInteger || bookingEndDayAsInteger < startDayAsInteger) continue

         const startingDayToIterate = Math.max(startDayAsInteger, bookingStartDayAsInteger)
         const endignDayToIterate = Math.min(endDayAsInteger, bookingEndDayAsInteger)

         for (let day = startingDayToIterate; day <= endignDayToIterate; day++) {
            if (occupancyMap[day]) continue
            occupancyMap[day] = true
         }
      }

      return occupancyMap
   }

   isOccupied(date) {
      const [startDayAsInteger] = Room.calculateStartAndEndDayAsInteger(date) //default current day
      const occupancyMap = this.calculateOcupancyMap(startDayAsInteger)
      console.log(occupancyMap)
      return !!occupancyMap[startDayAsInteger] //same as: occupancyMap[startDayAsInteger] ? true : false
   }

   occupancyPercentage(startDate, endDate) {
      const [startDayAsInteger, endDayAsInteger] = Room.calculateStartAndEndDayAsInteger(startDate, endDate)
      const occupancyMap = this.calculateOcupancyMap(startDayAsInteger, endDayAsInteger)
      const totalDays = endDayAsInteger - startDayAsInteger + 1
      const totalOccupiedDays = Object.keys(occupancyMap).length
      const percentage = totalOccupiedDays / totalDays * 100
      return percentage
   }

   static totalOccupancyPercentage(rooms, startDate, endDate) {
      if (!rooms.length) return null
      const [startDayAsInteger, endDayAsInteger] = Room.calculateStartAndEndDayAsInteger(startDate, endDate)
      const totalAddedPercentage = 0
      for (const room of rooms) {
         const occupancyPercentage = room.occupancyPercentage(startDayAsInteger, endDayAsInteger)
         totalAddedPercentage += occupancyPercentage
         /*
         otra forma sería con los Object.keys(occupancyPercentage) de cada room, pushearlos en un array
         común, y por último hacer un set => const occupiedDays = new Set(occupiedDaysOfAllRooms).size
         const occupancyMap = room.calculateOcupancyMap(startDayAsInteger, endDayAsInteger)
         totalOccupiedDays.push(Object.keys(occupancyMap))
         */
      }
      const totalPercentage = totalAddedPercentage / rooms.length

      return totalPercentage
   }

   static availableRooms(rooms, startDate, endDate) { //he supuesto que quieres rooms vacias en todos los dias de ese intervalo
      if (!rooms.length) return null
      const [startDayAsInteger, endDayAsInteger] = Room.calculateStartAndEndDayAsInteger(startDate, endDate)
      const availableRooms = []
      for (const room of rooms) {
         const occupancyMap = room.calculateOcupancyMap(startDayAsInteger, endDayAsInteger)
         if (Object.keys(occupancyMap).length === 0) availableRooms.push(room)
      }
      return availableRooms
   }

   // esto lo hubiese mergeado con el otro, pero lo he dejado así para que se entienda mejor
   static partialyAvailableRooms(rooms, startDate, endDate) {
      if (!rooms.length) return null
      const [startDayAsInteger, endDayAsInteger] = Room.calculateStartAndEndDayAsInteger(startDate, endDate)
      const numberOfDays = endDayAsInteger - startDayAsInteger + 1
      const partialyAvailableRooms = []
      for (const room of rooms) {
         const occupancyMap = room.calculateOcupancyMap(startDayAsInteger, endDayAsInteger)
         const numberOfOccupiedDays = Object.keys(occupancyMap).length
         if (numberOfOccupiedDays !== numberOfDays) partialyAvailableRooms.push(room)
      }
      return partialyAvailableRooms
   }

}


module.exports = { Room, Booking }