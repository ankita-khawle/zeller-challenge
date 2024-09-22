import readline from 'node:readline';
import * as process from 'process';

// Define types for Product and Offer
type Offer = {
    code: string;
    min?: number;
    discounted_price?: number;
};

type Product = {
    sku: string;
    name: string;
    price: number;
    offer?: Offer | null;
};

// Define prices array with typed data
const prices: Product[] = [
    {
        sku: 'ipd',
        name: 'Super iPad',
        price: 549.99,
        offer: {
            code: 'BULK_DISCOUNT',
            min: 4,
            discounted_price: 499.99
        }
    },
    {
        sku: 'mbp',
        name: 'MacBook Pro',
        price: 1399.99,
        offer: null
    },
    {
        sku: 'atv',
        name: 'Apple TV',
        price: 109.50,
        offer: {
            code: 'B2G1'
        }
    },
    {
        sku: 'vga',
        name: 'VGA adapter',
        price: 30.00
    }
];

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const cart: Map<string, number> = new Map();
console.log("");
console.log("<----------------------------------------------------------------->");
console.log("<----------------------------------------------------------------->");
console.log("<----------------Starting to scan the products-------------------->");
console.log("<----------------------------------------------------------------->");
console.log("<----------------------------------------------------------------->");
console.log("");
console.log("Please enter the product code one at a time :");

takeInput();

function takeInput(code?: string): void {
    if (code) {
        console.log("");
        rl.question('Scan another item, y/n   ---  ', (action: string) => {
            if (action === 'y') {
                takeInput();
            } else {
                rl.close();
                // terminate scanning, calculate total cart value now
                console.log("");
                const total = cartValue();
                console.log("Total expected   ---  $", total);
            }
        });
    } else {
        console.log("");
        rl.question('=>', (scannedCode: string) => {
            const product = prices.find(item => item.sku === scannedCode);
            if (product) {
                if (cart.get(product.sku)) {
                    cart.set(product.sku, (cart.get(product.sku) || 0) + 1);
                } else {
                    cart.set(product.sku, 1);
                }
            }
            takeInput(scannedCode);
        });
    }
}

function cartValue(): number {
    let totalValue = 0;
    cart.forEach((value: any, key: any) => {
        console.log(key, value)
        const product = prices.find(item => item.sku === key);
        if (product) {
            let calculatedValue = 0;
            if (product.offer?.code === 'B2G1') {
                calculatedValue = B2G1_calculator(product, value);
            } else if (product.offer?.code === 'BULK_DISCOUNT') {
                calculatedValue = BULK_DISCOUNT_calculator(product, value);
            } else {
                calculatedValue = product.price * value;
            }
            totalValue += calculatedValue;
        }
    });
    return totalValue;
}

function B2G1_calculator(productData: Product, units: number): number {
    const nonDiscountedUnits = Math.floor(units / 3);
    units = nonDiscountedUnits ? units - nonDiscountedUnits : units;
    return units * productData.price;
}

function BULK_DISCOUNT_calculator(productData: Product, units: number): number {
    const offerData = productData.offer;
    if (offerData && offerData.min && offerData.discounted_price) {
        const discountPriceUnits = units > offerData.min ? units - offerData.min : 0;
        if (discountPriceUnits) {
            units = offerData.min;
        }
        return (units * productData.price) + (discountPriceUnits * offerData.discounted_price);
    }
    return units * productData.price;
}
