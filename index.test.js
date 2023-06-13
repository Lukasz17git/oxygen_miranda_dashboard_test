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

/**
 * 
 *  ADD BOOKINGS
 * 
 */

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

/**
 * 
 *  REMOVE BOOKINGS
 * 
 */

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

/**
 * 
 *  IS OCCUPIED METHOD
 * 
 */

test('isOccupied should return false if there is no bookings inside', () => {
   const room = new Room()
   expect(room.isOccupied()).toBe(false)
})

test('isOccupied without an argument should return true if there is a booking for the current day, false otherwise', () => {
   const room = new Room()
   room.addBooking(new Booking({ checkIn: daysAgo(2), checkOut: daysAgo(1) }))
   expect(room.isOccupied()).toBe(false)
   room.addBooking(new Booking({ checkIn: new Date() }))
   expect(room.isOccupied()).toBe(true)
})

test('isOccupied will correctly calculate the day of a given date even if this one contains hours, minutes, seconds...', () => {
   const room = new Room()
   room.addBooking(new Booking({ checkIn: new Date('2023-06-13T21:21:15.678Z') }))
   expect(room.isOccupied(new Date('2023-06-13'))).toBe(true)
})

test('isOccupied should calculate the day by the timezone of the hotel (inside settings), even if the manager is logged in completly different timezone', () => {
   const room = new Room()
   room.addBooking(new Booking({ checkIn: new Date('2023-06-13T23:21:15.678Z') })) // 13-06 in UTC, but 14-06 in Spain (default settings)
   expect(room.isOccupied(new Date('2023-06-14'))).toBe(true) //true for 14-06 for a UTC date of [13-06 23h], because that date is 14-06 in Spain
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

/**
 * 
 *  OCCUPANCY PERCENTAGE METHOD
 * 
 */

test('occupancyPercentage should return 0 if there is no bookings', () => {
   const room = new Room()
   expect(room.occupancyPercentage(new Date())).toBe(0)
})

test('occupancyPercentage should return the check for current date if there is no arguments provided; 0 for empty, 100 for occupied', () => {
   const room = new Room()
   expect(room.occupancyPercentage()).toBe(0)
   room.addBooking(new Booking({ checkIn: new Date() }))
   expect(room.occupancyPercentage()).toBe(100)
})

test('occupancyPercentage should check until the current date if only starting date is provided', () => {
   const room = new Room()
   room.addBooking(new Booking({ checkIn: new Date() }))
   expect(room.occupancyPercentage(daysAgo(1))).toBe(50)
   expect(room.occupancyPercentage(daysAgo(2))).toBe(33)
   expect(room.occupancyPercentage(daysAgo(3))).toBe(25)
})

test('occupancyPercentage will count as 1 day if the starting and ending date is the same', () => {
   const room = new Room()
   room.addBooking(new Booking({ checkIn: new Date() }))
   expect(room.occupancyPercentage(daysAgo(1), daysAgo(1))).toBe(0)
})

test('occupancyPercentage should return a rounded integer, between 0 and 100, where 0 is 0% and 100 is 100% of occupancy and so on', () => {
   const room = new Room()
   room.addBooking(new Booking({ checkIn: new Date() }))
   expect(room.occupancyPercentage(daysAgo(1))).toBe(50)
   expect(room.occupancyPercentage(daysAgo(2))).toBe(33)
   expect(room.occupancyPercentage(daysAgo(3))).toBe(25)

   const room2 = new Room()
   room2.addBooking(new Booking({ checkIn: daysAgo(5), checkOut: daysAgo(2) }))
   expect(room2.occupancyPercentage(daysAgo(1))).toBe(0)
   expect(room2.occupancyPercentage(daysAgo(2))).toBe(Math.round(1 / 3 * 100))
   expect(room2.occupancyPercentage(daysAgo(3))).toBe(Math.round(2 / 4 * 100))
   expect(room2.occupancyPercentage(daysAgo(4))).toBe(Math.round(3 / 5 * 100))
   expect(room2.occupancyPercentage(daysAgo(5))).toBe(Math.round(4 / 6 * 100))

   expect(room2.occupancyPercentage(daysAgo(2), daysAgo(1))).toBe(Math.round(1 / 2 * 100))
   expect(room2.occupancyPercentage(daysAgo(3), daysAgo(1))).toBe(Math.round(2 / 3 * 100))
   expect(room2.occupancyPercentage(daysAgo(3), daysAgo(1))).toBe(Math.round(67)) //66.666 => 67 because are rounded

})

test('occupancyPercentage will count ending date as current date if ending date is less than starting date', () => {
   const room = new Room()
   room.addBooking(new Booking({ checkIn: new Date() }))
   expect(room.occupancyPercentage(daysAgo(1), daysAgo(2))).toBe(room.occupancyPercentage(daysAgo(1)))
   expect(room.occupancyPercentage(daysAgo(5), daysAgo(6))).toBe(room.occupancyPercentage(daysAgo(5)))
   expect(room.occupancyPercentage(daysAgo(5), daysAgo(6))).toBe(room.occupancyPercentage(daysAgo(5), new Date()))
})

/**
 * 
 *  TOTAL OCCUPANCY PERCENTAGE METHOD
 * 
 */

test('totalOccupancyPercentage should return null if there is no rooms provided as argument', () => {
   expect(Room.totalOccupancyPercentage()).toBe(null)
   expect(Room.totalOccupancyPercentage(null, daysAgo(2), daysAgo(1))).toBe(null)
   expect(Room.totalOccupancyPercentage([])).toBe(null)
})

test('totalOccupancyPercentage should throw an error if there is at least one no-room inside rooms array', () => {
   expect(() => Room.totalOccupancyPercentage([{}])).toThrow()
   expect(() => Room.totalOccupancyPercentage([new Room(), {}])).toThrow()
})

test('totalOccupancyPercentage should return 0 if there is no bookings inside rooms', () => {
   const room1 = new Room()
   const room2 = new Room()
   const rooms = [room1, room2]
   expect(Room.totalOccupancyPercentage(rooms)).toBe(0)
   expect(Room.totalOccupancyPercentage(rooms, daysAgo(2))).toBe(0)
   expect(Room.totalOccupancyPercentage(rooms, daysAgo(2), daysAgo(1))).toBe(0)
   expect(Room.totalOccupancyPercentage(rooms, daysAgo(2), daysAgo(5))).toBe(0)
})

test('totalOccupancyPercentage should return the check for current date if there are no dates provided; 0 for empty, 100 for occupied', () => {
   const room = new Room()
   const rooms = [room]
   expect(Room.totalOccupancyPercentage(rooms)).toBe(0)
   room.addBooking(new Booking({ checkIn: daysAgo(1), checkOut: daysAgo(1) }))
   expect(Room.totalOccupancyPercentage(rooms)).toBe(0)
   room.addBooking(new Booking({ checkIn: new Date() }))
   expect(Room.totalOccupancyPercentage(rooms)).toBe(100)
})

test('totalOccupancyPercentage should check until the current date if only starting date is provided', () => {
   const room = new Room()
   room.addBooking(new Booking())
   const rooms = [room]
   expect(Room.totalOccupancyPercentage(rooms)).toBe(100)
   expect(Room.totalOccupancyPercentage(rooms, daysAgo(0))).toBe(100)
   expect(Room.totalOccupancyPercentage(rooms, daysAgo(1))).toBe(50)
   expect(Room.totalOccupancyPercentage(rooms, daysAgo(2))).toBe(33)
   expect(Room.totalOccupancyPercentage(rooms, daysAgo(3))).toBe(25)
})

test('totalOccupancyPercentage will count as 1 day if the starting and ending date is the same', () => {
   const room = new Room()
   room.addBooking(new Booking({ checkIn: new Date() }))
   const rooms = [room]
   expect(Room.totalOccupancyPercentage(rooms, daysAgo(1), daysAgo(1))).toBe(0)
   expect(Room.totalOccupancyPercentage(rooms, daysAgo(0), daysAgo(0))).toBe(100)
})

test('totalOccupancyPercentage will count ending date as current date if ending date is less than starting date', () => {
   const room = new Room()
   room.addBooking(new Booking({ checkIn: new Date() }))
   const rooms = [room]
   expect(Room.totalOccupancyPercentage(rooms, daysAgo(1), daysAgo(2))).toBe(50)
   expect(Room.totalOccupancyPercentage(rooms, daysAgo(0), daysAgo(2))).toBe(100)
})

test('totalOccupancyPercentage should return a rounded integer, between 0 and 100, where 0 is 0% and 100 is 100% of occupancy between ALL ROOMS, and so on', () => {
   const room1 = new Room().addBooking(new Booking({ checkIn: daysAgo(10), checkOut: daysAgo(8) }))
   const room2 = new Room().addBooking(new Booking({ checkIn: daysAgo(6), checkOut: daysAgo(4) }))
   const room3 = new Room().addBooking(new Booking({ checkIn: daysAgo(1) }))
   const rooms = [room1, room2, room3]

   expect(Room.totalOccupancyPercentage(rooms)).toBe(33)
   expect(Room.totalOccupancyPercentage(rooms, daysAgo(0))).toBe(33) // 0% + 0% + 100% (1 day)
   expect(Room.totalOccupancyPercentage(rooms, daysAgo(1))).toBe(33) // 0% + 0% + 100% (2 days)
   expect(Room.totalOccupancyPercentage(rooms, daysAgo(2))).toBe(22) // 0% + 0% + 67% (3 days)
   expect(Room.totalOccupancyPercentage(rooms, daysAgo(3))).toBe(17) // 0% + 0% + 50% (4 days)
   expect(Room.totalOccupancyPercentage(rooms, daysAgo(4))).toBe(20) // 20% + 0% + 40% (5 days)
   expect(Room.totalOccupancyPercentage(rooms, daysAgo(5))).toBe(22) // 33% + 0% + 33% (6 days)
   expect(Room.totalOccupancyPercentage(rooms, daysAgo(6))).toBe(24) // 43% + 0% + 29% (7 days)
   expect(Room.totalOccupancyPercentage(rooms, daysAgo(7))).toBe(21) // 38% + 0% + 25% (8 days)
   expect(Room.totalOccupancyPercentage(rooms, daysAgo(8))).toBe(22) // 33% + 11% + 22% (9 days)
   expect(Room.totalOccupancyPercentage(rooms, daysAgo(9))).toBe(23) // 30% + 20% + 20% (10 days)

   expect(Room.totalOccupancyPercentage(rooms, daysAgo(9), daysAgo(8))).toBe(33) // 100% + 0% + 0% 
   expect(Room.totalOccupancyPercentage(rooms, daysAgo(8), daysAgo(6))).toBe(22) // 33% + 33% + 0% 
})

/**
 * 
 *  AVAILABLE ROOMS METHOD
 * 
 */

test('availableRooms should return null if there is no rooms provided as argument', () => {
   expect(Room.availableRooms()).toBe(null)
   expect(Room.availableRooms(null, daysAgo(2), daysAgo(1))).toBe(null)
})

test('availableRooms should return [] if there is an empty array', () => {
   const rooms = []
   expect(Room.availableRooms(rooms)).toEqual([])
   expect(Room.availableRooms(rooms, daysAgo(2))).toEqual([])
   expect(Room.availableRooms(rooms, daysAgo(2), daysAgo(1))).toEqual([])
   expect(Room.availableRooms(rooms, daysAgo(2), daysAgo(5))).toEqual([])
})

test('availableRooms should throw an error if there is at least one no-room inside rooms array', () => {
   expect(() => Room.availableRooms([{}])).toThrow()
   expect(() => Room.availableRooms([new Room(), {}])).toThrow()
})

test('availableRooms should return the check for current date if there are no dates provided', () => {
   const room1 = new Room().addBooking(new Booking({ checkIn: daysAgo(1) }))
   const room2 = new Room().addBooking(new Booking({ checkIn: daysAgo(3), checkOut: daysAgo(2) }))
   const rooms = [room1, room2]
   expect(Room.availableRooms(rooms)).toEqual([room2])
})

test('availableRooms should check until the current date if only starting date is provided', () => {
   const room1 = new Room().addBooking(new Booking({ checkIn: daysAgo(1) }))
   const room2 = new Room().addBooking(new Booking({ checkIn: daysAgo(3), checkOut: daysAgo(2) }))
   const rooms = [room1, room2]
   expect(Room.availableRooms(rooms, daysAgo(2))).toEqual([])
   expect(Room.availableRooms(rooms, daysAgo(1))).toEqual([room2])
})

test('availableRooms will count ending date as current date if ending date is less than starting date', () => {
   const room1 = new Room().addBooking(new Booking({ checkIn: daysAgo(1) }))
   const room2 = new Room().addBooking(new Booking({ checkIn: daysAgo(3), checkOut: daysAgo(2) }))
   const rooms = [room1, room2]
   expect(Room.availableRooms(rooms, daysAgo(2), daysAgo(4))).toEqual([])
   expect(Room.availableRooms(rooms, daysAgo(1), daysAgo(4))).toEqual([room2])
})

test('availableRooms will count as 1 day if the starting and ending date is the same', () => {
   const room1 = new Room().addBooking(new Booking({ checkIn: daysAgo(1) }))
   const room2 = new Room().addBooking(new Booking({ checkIn: daysAgo(3), checkOut: daysAgo(1) }))
   const rooms = [room1, room2]
   expect(Room.availableRooms(rooms, daysAgo(0), daysAgo(0))).toEqual([room2])
   expect(Room.availableRooms(rooms, daysAgo(1), daysAgo(1))).toEqual([])
})

test('availableRooms should return [] if there is no available rooms', () => {
   const room1 = new Room().addBooking(new Booking({ checkIn: daysAgo(1) }))
   const room2 = new Room().addBooking(new Booking({ checkIn: daysAgo(3), checkOut: daysAgo(1) }))
   const rooms = [room1, room2]
   expect(Room.availableRooms(rooms)).toEqual([room2])
   expect(Room.availableRooms(rooms, daysAgo(2))).toEqual([])
   expect(Room.availableRooms(rooms, daysAgo(2), daysAgo(1))).toEqual([])
   expect(Room.availableRooms(rooms, daysAgo(2), daysAgo(5))).toEqual([])
})


test('availableRooms should return the available rooms if there is an available room across all choosen days', () => {
   const room1 = new Room().addBooking(new Booking({ checkIn: daysAgo(1) }))
   const room2 = new Room().addBooking(new Booking({ checkIn: daysAgo(3), checkOut: daysAgo(1) }))
   const rooms = [room1, room2]
   expect(Room.availableRooms(rooms)).toEqual([room2])
   expect(Room.availableRooms(rooms, daysAgo(1))).toEqual([])
   expect(Room.availableRooms(rooms, daysAgo(2))).toEqual([])
   expect(Room.availableRooms(rooms, daysAgo(2), daysAgo(1))).toEqual([])
   expect(Room.availableRooms(rooms, daysAgo(3), daysAgo(2))).toEqual([room1])
   expect(Room.availableRooms(rooms, daysAgo(8), daysAgo(4))).toEqual([room1, room2])
})

test('availableRooms should return the same order as the rooms provided', () => {
   const room1 = new Room().addBooking(new Booking({ checkIn: daysAgo(1) }))
   const room2 = new Room().addBooking(new Booking({ checkIn: daysAgo(3), checkOut: daysAgo(1) }))
   const rooms = [room1, room2]
   expect(Room.availableRooms(rooms, daysAgo(8), daysAgo(4))).toEqual([room1, room2])
})

/**
 * 
 *  BOOKING FEE GETTER
 * 
 */

test('get fee() should throw an error if the booking is not asociated with a room', () => {
   const booking = new Booking({ discount: 50 })
   expect(() => booking.fee).toThrow()
})

test('get fee() should throw an error if the discount is not an integer', () => {
   const booking = new Booking({ discount: 50.5 })
   const booking2 = new Booking({ discount: 'not integer' })
   expect(() => booking.fee).toThrow()
   expect(() => booking2.fee).toThrow()
})

test('get fee() should throw an error if the discount of the room is not an integer', () => {
   const room = new Room({ discount: 200.20 })
   const room2 = new Room({ discount: 'not integer' })
   const booking = new Booking({ discount: 10 })
   const booking2 = new Booking({ discount: 10 })
   booking.addRoom(room)
   booking2.addRoom(room2)
   expect(() => booking.fee).toThrow()
   expect(() => booking2.fee).toThrow()
})

test('get fee() should throw an error if the price of the room is not an integer', () => {
   const room = new Room({ price: 200.20 })
   const room2 = new Room({ price: 'not integer' })
   const booking = new Booking({ discount: 10 })
   const booking2 = new Booking({ discount: 10 })
   booking.addRoom(room)
   booking2.addRoom(room2)
   expect(() => booking.fee).toThrow()
   expect(() => booking2.fee).toThrow()
})

test('get fee() should throw an error if the discount of the booking is bigger than 100', () => {
   const booking = new Booking({ discount: 120 })
   expect(() => booking.fee).toThrow()
})

test('get fee() should throw an error if the discount of the room is bigger than 100', () => {
   const room = new Room({ discount: 200 })
   const booking = new Booking({ discount: 10 })
   booking.addRoom(room)
   expect(() => booking.fee).toThrow()
})

test('get fee() should throw an error if the price is negative', () => {
   const room = new Room({ discount: 10, price: -10 })
   const booking = new Booking({ discount: 10 })
   booking.addRoom(room)
   expect(() => booking.fee).toThrow()
})

test('get fee() should throw an error if the discount of the room is negative', () => {
   const room = new Room({ discount: -10, price: 20000 })
   const booking = new Booking({ discount: 10 })
   booking.addRoom(room)
   expect(() => booking.fee).toThrow()
})

test('get fee() should throw an error if the discount of the booking is negative', () => {
   const booking = new Booking({ discount: -10 })
   expect(() => booking.fee).toThrow()
})

test('get fee() should return the total fee, in cents as integer, for valid values', () => {
   const room = new Room({ discount: 50, price: 20000 })
   const booking = new Booking({ discount: 50 })
   booking.addRoom(room)
   expect(booking.fee).toBe(5000)
})

test('get fee() should round the value to an integer and never return a float value', () => {
   const booking = new Booking({ discount: 5 }).addRoom(new Room({ price: 1000, discount: 87 })) // price = 1€ * 0.95 * 0.13
   const booking2 = new Booking({ discount: 13 }).addRoom(new Room({ price: 100, discount: 27 })) // price = 1€ * 0.87 * 0.73
   expect(booking.fee).toBe(124) // 1,24€
   expect(booking2.fee).toBe(64) // 0,64€
})

test('get fee() should return 0 if any of the discounts is 100', () => {
   const room = new Room({ discount: 100, price: 20000 })
   const room2 = new Room({ discount: 0, price: 20000 })
   const booking = new Booking({ discount: 50 })
   const booking2 = new Booking({ discount: 100 })
   booking.addRoom(room)
   booking2.addRoom(room2)
   expect(booking.fee).toBe(0)
   expect(booking2.fee).toBe(0)
})