const CLR_BLACK = 'hsl(0, 0%, 0%)';
const CLR_WHITE = 'hsl(0, 0%, 100%)';

const hexToHSL = (hex) => {
    // Remove the hash at the start if it's there
    hex = hex.replace(/^#/, '');

    // Parse r, g, b values
    let r = parseInt(hex.substring(0, 2), 16) / 255;
    let g = parseInt(hex.substring(2, 4), 16) / 255;
    let b = parseInt(hex.substring(4, 6), 16) / 255;

    // Find min and max values
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // Achromatic
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h = Math.round(h * 60);
    }

    s = Math.round(s * 100);
    l = Math.round(l * 100);
    return `hsl(${h}, ${s}%, ${l}%)`;
};

const isDarkMode = (hex) => {
    // Remove the hash at the start if it's there
    hex = hex.replace(/^#/, '');

    // Convert to RGB
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    // Convert RGB to relative luminance
    function luminance(value) {
        let v = value / 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    }

    let L = 0.2126 * luminance(r) + 0.7152 * luminance(g) + 0.0722 * luminance(b);

    // Define a threshold (0.5 is a common choice)
    return L < 0.5;
};

const adjustHSL = (hsl, percentage, exact) => {
    // Extract H, S, and L from the HSL string
    let match = hsl.match(/^hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)$/);
    if (!match) {
        throw new Error("Invalid HSL format. Use 'hsl(H, S%, L%)'");
    }

    let h = parseInt(match[1], 10);
    let s = parseInt(match[2], 10);
    let l = parseInt(match[3], 10);

    // Adjust the Lightness by the given percentage
    //l = Math.max(0, Math.min(100, l + (l * percentage) / 100));
    if (exact) {   
        l = percentage;
    } else {
        l = l + ((100 - l) * percentage / 100);
    }

    // Return the new HSL color
    return `hsl(${h}, ${s}%, ${Math.round(l)}%)`;
};

const updateColors = () => {
    const raw = {
        main_bg: $('#in-main-bg-color').val(),
        main_text: $('#in-main-text-color').val(),
        primary_main: $('#in-primary-main-color').val(),
        secondary_main: $('#in-secondary-main-color').val(),
    };

    const is_dark_mode = isDarkMode(raw.main_bg);
    const multiplier = is_dark_mode ? -1 : 1;

    const hsl = {
        main_bg: hexToHSL(raw.main_bg),
        main_text: hexToHSL(raw.main_text),
        primary_main: hexToHSL(raw.primary_main),
        secondary_main: hexToHSL(raw.secondary_main),
    };

    hsl.secondary_bg = is_dark_mode ? adjustHSL(hsl.main_bg, 30, true) : adjustHSL(hsl.main_bg, 90, true);

    hsl.light_text = is_dark_mode ? CLR_BLACK : CLR_WHITE;
    hsl.dark_text = is_dark_mode ? CLR_WHITE : CLR_BLACK;

    hsl.primary_light = adjustHSL(hsl.primary_main, multiplier * 20);
    hsl.primary_lightest = adjustHSL(hsl.primary_main, multiplier * 90);
    hsl.primary_dark = adjustHSL(hsl.primary_main, multiplier * -20);
    
    hsl.secondary_light = adjustHSL(hsl.secondary_main, multiplier * 20);

    $(':root').css('--main-bg-color', hsl.main_bg);
    $(':root').css('--secondary-bg-color', hsl.secondary_bg);
    
    $(':root').css('--dark-text-color', hsl.dark_text);
    $(':root').css('--main-text-color', hsl.main_text);
    $(':root').css('--light-text-color', hsl.light_text);
    
    $(':root').css('--primary-dark-color', hsl.primary_dark);
    $(':root').css('--primary-main-color', hsl.primary_main);
    $(':root').css('--primary-light-color', hsl.primary_light);
    $(':root').css('--primary-lightest-color', hsl.primary_lightest);

    $(':root').css('--secondary-main-color', hsl.secondary_main);
    $(':root').css('--secondary-light-color', hsl.secondary_light);
};

$(document).ready(() => {
    $('#in-main-bg-color, #in-main-text-color, #in-primary-main-color, #in-secondary-main-color')
        .change(() => {
            updateColors();
        });
    $('#btn-update-colors').click(() => {
        updateColors();
    });
    updateColors();
});