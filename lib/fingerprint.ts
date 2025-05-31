import FingerprintJS from "@fingerprintjs/fingerprintjs";

export async function getDeviceId(): Promise<string> {
    // Initialize an agent at application startup.
    const fpPromise = FingerprintJS.load();

    // Get the visitor identifier when you need it.
    const fp = await fpPromise;
    const result = await fp.get();

    // This is the visitor identifier:
    return result.visitorId;
}
