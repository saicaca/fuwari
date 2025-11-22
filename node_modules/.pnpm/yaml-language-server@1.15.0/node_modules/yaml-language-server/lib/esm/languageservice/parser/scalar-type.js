/**
 * Parse a boolean according to the specification
 *
 * Return:
 *  true if its a true value
 *  false if its a false value
 */
export function parseYamlBoolean(input) {
    if (['true', 'True', 'TRUE', 'y', 'Y', 'yes', 'Yes', 'YES', 'on', 'On', 'ON'].lastIndexOf(input) >= 0) {
        return true;
    }
    else if (['false', 'False', 'FALSE', 'n', 'N', 'no', 'No', 'NO', 'off', 'Off', 'OFF'].lastIndexOf(input) >= 0) {
        return false;
    }
    throw `Invalid boolean "${input}"`;
}
//# sourceMappingURL=scalar-type.js.map