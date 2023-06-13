const { Room, Booking } = require("./index")



const notBooking = {
   id: 'the_id',
   name: 'Booking',
   email: 'email@hotel.com',
   checkIn: new Date(),
   checkOut: new Date(),
   discount: 0,
   room: null
}
const day = 24 * 60 * 60 * 1000
const daysAgo = (days) => new Date(Date.now() - days * day)
const daysInFuture = (days) => new Date(Date.now() + days * day)

/**
 * ROOM TEST
 */
test('Room class constructor', () => {

   // Default Room
   const roomDefault = new Room()
   expect(typeof roomDefault.id).toBe('string')
   expect(roomDefault.name).toBe('Room')
   expect(roomDefault.price).toBe(0)
   expect(roomDefault.discount).toBe(0)
   expect(roomDefault.bookings).toEqual([])

   // Room 1
   const room1 = new Room({ name: 'Premium Room', price: 15000, discount: 10 })
   expect(room1.name).toBe('Premium Room')
   expect(room1.price).toBe(15000)
   expect(room1.discount).toBe(10)

   // Room 2
   const room2 = new Room({ name: 'Premium Room', price: 15000, discount: 120 })
   expect(room2.name).toBe('Premium Room')
   expect(room2.price).toBe(15000)
   expect(room2.discount).toBe(120)

})

test('addBooking method should add a booking and add a property called room to the booking', () => {
   const room = new Room()
   const booking = new Booking()
   expect(room.addBooking(booking)).toBe(room)
   expect(room.addBooking(booking).bookings).toBe(room.bookings)
   expect(room.addBooking(booking).bookings.at(-1)).toBe(booking)
   expect(room.addBooking(booking).bookings.at(-1).room).toBe(room)
})

test('addBooking method should throw if the provided Booking is not an instance of Booking', () => {
   const room = new Room()
   expect(() => room.addBooking({})).toThrow()
   expect(() => room.addBooking(notBooking)).toThrow()
})

test('addBookings method should add all the bookings and add a property called room to each of the bookings', () => {
   const room = new Room()
   const booking = new Booking()
   const booking2 = new Booking()
   expect(room.addBookings([booking, booking2])).toBe(room)
   expect(room.addBookings([booking, booking2]).bookings).toBe(room.bookings)
   expect(room.addBookings([booking, booking2]).bookings.at(-1)).toBe(booking2)
   expect(room.addBookings([booking, booking2]).bookings.at(-1).room).toBe(room)
})

test('addBookings method should throw if the provided Bookings is not an array of Booking instances', () => {
   const room = new Room()
   expect(() => room.addBooking([])).toThrow()
   expect(() => room.addBooking([notBooking])).toThrow()
})


test('removeBooking should remove the booking from the room and also set the room property of the booking to null', () => {
   const room = new Room()
   const booking = new Booking()
   const booking2 = new Booking()
   expect(room.removeBooking(2)).toBe(room)
   expect(room.removeBooking(1).bookings).toEqual([])
   expect(room.removeBooking(100).bookings).toEqual([])
   expect(room.removeBooking("id_something").bookings).toEqual([])
   // have to create new booking instance because it keeps the bookings
   expect(new Room().addBooking(booking).removeBooking(0).bookings.length).toBe(0)
   expect(new Room().addBooking(booking).removeBooking(1).bookings.length).toBe(1)
   expect(new Room().addBooking(booking).removeBooking(1000).bookings.length).toBe(1)
   expect(new Room().addBookings([booking, booking2]).removeBooking(-1).bookings.length).toBe(1)
   expect(new Room().addBookings([booking, booking2]).removeBooking(-1).removeBooking(-1).bookings.length).toBe(0)
   expect(new Room().addBooking(booking).removeBooking('something').bookings.length).toBe(1)

   //testing the room prop of booking
   const bookingWithoutRoom = new Booking()
   expect(bookingWithoutRoom.room).toBe(null)
   const roomWithBooking = new Room().addBooking(bookingWithoutRoom)
   expect(bookingWithoutRoom.room).toBe(roomWithBooking)
   roomWithBooking.removeBooking(0)
   expect(bookingWithoutRoom.room).toBe(null)

})

test('isOccupied should return false if there is no bookings inside', () => {
   const room = new Room()
   expect(room.isOccupied()).toBe(false)
})

test('isOccupied without argument should return true if there is a booking for the current day', () => {
   const room = new Room()
   room.addBooking(new Booking({ checkIn: new Date() }))
   expect(room.isOccupied()).toBe(true)
})

test('isOccupied should return true if there is a booking in the selected date and false otherwise', () => {
   const room = new Room()
   room.addBooking(new Booking({ checkIn: daysAgo(5), checkOut: daysAgo(2) }))
   expect(room.isOccupied(daysAgo(3))).toBe(true)
   expect(room.isOccupied(daysAgo(7))).toBe(false)
   expect(room.isOccupied(daysAgo(1))).toBe(false)
   expect(room.isOccupied(daysInFuture(1))).toBe(false)
   expect(room.isOccupied()).toBe(false)
})

test('isOccupied should return true if there is a booking without checkOut date, where it counts as current running day', () => {
   const room = new Room()
   room.addBooking(new Booking({ checkIn: daysAgo(5) }))
   expect(room.isOccupied()).toBe(true)
   expect(room.isOccupied(daysAgo(3))).toBe(true)
   expect(room.isOccupied(daysAgo(7))).toBe(false)
   expect(room.isOccupied(daysAgo(1))).toBe(true)
   expect(room.isOccupied(daysInFuture(1))).toBe(false)
})

test('isOccupied method should return true if a room has a booking with the same dates as checkIn and checkOut', () => {
   const room = new Room()
   expect(room.isOccupied()).toBe(false)
   const booking = new Booking({ checkIn: new Date('06-13-2023'), checkOut: new Date('06-13-2023') })
   room.addBooking(booking)
   expect(room.isOccupied(new Date('06-13-2023'))).toBe(true)
})

test('isOccupied with dates in future should return only true if the checkIn date is the same to the isOccupied argument', () => {
   const room = new Room()
   room.addBooking(new Booking({ checkIn: daysInFuture(1) }))
   expect(room.isOccupied(daysInFuture(0))).toBe(false)
   expect(room.isOccupied(daysInFuture(1))).toBe(true)
   expect(room.isOccupied(daysInFuture(2))).toBe(false)
   expect(room.isOccupied(daysInFuture(6))).toBe(false)
})


// OCCUPANCY PERCENTAGE

