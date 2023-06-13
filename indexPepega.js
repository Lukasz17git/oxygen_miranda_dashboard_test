const { Room, Booking } = require("./index")

const allValueTypes = [null, undefined, NaN, true, false, 0, 1, 1.111, -10, '', 'something', [], {}, new Map(), new Set(), new Date()];
const possibleNumbers = [0, 1, 0.555, 87, 1000, -20, -2.5550, Infinity, -Infinity, NaN]


/**
 * ROOM TEST
 */

const defaultName = ''
const defaultEmail = ''
const defaultPrice = 0
const defaultDiscount = 0

test('Room class constructor', () => {
   const room = new Room()
   expect(typeof room.id).toBe('string')
   expect(room.name).toBe('')
   expect(room.price).toBe(0)
   expect(room.discount).toBe(0)
   expect(room.bookings).toEqual([])
})

/**
 * ROOM INVALID AND VALID VALUES
 */

test.each(allValueTypes)("Should return default values for invalid values", (value) => {
   const room = new Room(value, value, value)
   expect(room.name).toBe(typeof value === "string" ? value : defaultName)
   expect(room.price).toBe(typeof value === "number" ? parseInt(value) || defaultPrice : defaultPrice)
   expect(room.discount).toBe(typeof value === "number" ? parseInt(value) || defaultDiscount : defaultDiscount)
})

/**
 * ROOM PRICE TEST
 */

test.each(possibleNumbers)('Room price should return an positive integer', (value) => {
   const room = new Room('', value)
   expect(room.price).toBeGreaterThanOrEqual(0)
   expect(Number.isInteger(room.price)).toBe(true)
})

/**
 * ROOM DISCOUNT TEST
 */

test.each(possibleNumbers)('Room discount should return an integer between 0 and 100', (value) => {
   const room = new Room('', value)
   expect(room.discount).toBeGreaterThanOrEqual(0)
   expect(room.discount).toBeLessThanOrEqual(100)
   expect(Number.isInteger(room.discount)).toBe(true)
})


/**
 * BOOKING TEST
 */

test('Defaut Booking instance', () => {
   const booking = new Booking()
   expect(typeof booking.id).toBe('string')
   expect(booking.name).toBe(defaultName)
   expect(booking.email).toBe(defaultEmail)
   expect(booking.checkIn.getTime()).toBeCloseTo(Date.now())
   expect(booking.checkOut.getTime()).toBeCloseTo(Date.now())
   expect(booking.discount).toEqual(defaultPrice)
   expect(booking.room).toBe(null)
})

/**
 * BOOKING INVALID AND VALID VALUES
 */

test.each(allValueTypes)("Should return default values for invalid values", (value) => {
   const booking = new Booking(value, value, value, value, value)
   expect(booking.name).toBe(typeof value === "string" ? value : defaultName)
   expect(booking.email).toBe(typeof value === "string" ? value : defaultEmail)
   expect(booking.checkIn instanceof Date).toBe(true)
   expect(booking.checkOut instanceof Date).toBe(true)
   expect(booking.discount).toBe(typeof value === "number" ? parseInt(value) || defaultDiscount : defaultDiscount)
})


/**
 * BOOKING DISCOUNT TEST
 */

test.each(possibleNumbers)('Booking discount should return an integer between 0 and 100', (value) => {
   const room = new Booking('', '', null, null, value)
   expect(room.discount).toBeGreaterThanOrEqual(0)
   expect(room.discount).toBeLessThanOrEqual(100)
   expect(Number.isInteger(room.discount)).toBe(true)
})