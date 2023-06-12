const { Room, Booking } = require("./index")


const allValueTypes = [null, undefined, NaN, true, false, 0, 1, 1.111, '', 'something', [], {}, new Map(), new Set(), new Date()];
const possibleNumbers = [0, 1, 0.555, 87, 1000, -20, -2.5550, Infinity, -Infinity]


test('Defaut Room instance', () => {
   const room = new Room()
   expect(typeof room.id).toBe('string')
   expect(room.name).toBe('')
   expect(room.price).toBe(0)
   expect(room.discount).toBe(0)
   expect(room.bookings).toEqual([])
})

test.each(allValueTypes)("Room instance with valid and invalid types", (value) => {
   const room = new Room(value, value, value)
   expect(room.name).toBe(typeof value === "string" ? value : "")
   expect(room.price).toBe(typeof value === "number" ? parseInt(value) || 0 : 0)
   expect(room.discount).toBe(typeof value === "number" ? parseInt(value) || 0 : 0)
})


test.each(possibleNumbers)('Room price should return an positive integer', (value) => {
   const room = new Room('', value)
   expect(room.price).toBeGreaterThanOrEqual(0)
   expect(Number.isInteger(room.price)).toBe(true)
})


test.each(possibleNumbers)('Room discount should return an integer between 0 and 100', (value) => {
   const room = new Room('', value)
   expect(room.discount).toBeGreaterThanOrEqual(0)
   expect(room.discount).toBeLessThanOrEqual(100)
   expect(Number.isInteger(room.discount)).toBe(true)
})



const room = new Room()
const booking = new Booking()

room.addBooking(booking)
console.log(room.bookings)
room.removeBooking(0)
console.log(room.bookings)
console.log(room.isOccupied())