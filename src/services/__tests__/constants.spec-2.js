import { isDarkMode } from '../constants'

describe('isDarkMode', () => {
    it('has matchMedia', () => {
        window.matchMedia = undefined 
        expect(isDarkMode()).toBe(false);
    })
})

describe('isDarkMode', () => {
    it('has darkMode', () => {
        window.matchMedia = () => {
            return { matches: true }
        }
        expect(isDarkMode()).toBe(true)
    })
})

describe('isDarkMode', () => {
    it('has lightMode', () => {
        window.matchMedia = () => {
            return { matches: false }
        }
        expect(isDarkMode()).toBe(false)
    })
})