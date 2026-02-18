export function getErrorMessage(error) {
    switch (error.code) {
        case 'auth/email-already-in-use':
            return 'This email is already in use. Please try another one.';
        case 'auth/invalid-email':
            return 'The email address is not valid. Please enter a valid email.';
        case 'auth/operation-not-allowed':
            return 'Email/password accounts are not enabled. Please contact support.';
        case 'auth/weak-password':
            return 'The password is too weak. Please choose a stronger password.';
        default:
            return 'An unexpected error occurred. Please try again later.';
    }
}