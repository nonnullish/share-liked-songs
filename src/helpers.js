export const extractID = (input) => {
    try {
        const url = new URL(input);
        const id = url.pathname.replace(/\/$/, "").split('/').at(-1);
        return id;
    }
    catch (e) {
        return null;
    }
}