export default function bigIntConverter(delta) {
    const data = JSON.stringify(delta, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
    );
    return data;
}

