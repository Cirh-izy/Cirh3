// Augmenta el módulo existente de firebase/auth
import 'firebase/auth';

declare module 'firebase/auth' {
    // usa el tipo Persistence de firebase/auth
    export function getReactNativePersistence(
        storage: unknown
    ): import('firebase/auth').Persistence;
}