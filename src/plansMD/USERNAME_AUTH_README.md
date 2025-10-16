# Username-Based Authentication

This application now supports username-based authentication. Students can register with just a username and use their username to log in. Email addresses are no longer required for student registration.

## Features

### 1. Username-Only Registration

- Students can register using only a username (no email required)
- Username requirements:
  - Minimum 3 characters
  - Only letters, numbers, and underscores allowed
  - Must be unique across all users
- Real-time username availability checking with debounced API calls
- System automatically generates unique email addresses for Firebase Auth compatibility

### 2. Username-Based Login

- Users can log in using their username
- The system automatically handles the email lookup for Firebase Auth
- Clean, simple login experience

### 3. Password Reset

- Password reset functionality works with username
- System looks up the corresponding generated email address

## Technical Implementation

### Database Structure

- New `usernames` collection in Firestore
- Each document contains:
  - `username`: lowercase username
  - `email`: generated email address (for Firebase Auth compatibility)
  - `uid`: user ID
  - `createdAt`: timestamp

### Email Generation

Since Firebase Auth requires email addresses, the system automatically generates unique email addresses using the format:

```
{username}@{schoolId}.student.local
```

This ensures:

- Each student has a unique email for Firebase Auth
- The email is tied to their school
- No conflicts with real email addresses
- Students don't need to provide or remember an email

### Key Functions

#### `checkUsernameAvailability(username)`

- Checks if a username is available
- Returns boolean indicating availability

#### `storeUsernameMapping(username, email, uid)`

- Stores username-to-email mapping in Firestore
- Called during user registration

#### `getEmailByUsername(username)`

- Retrieves generated email address for a given username
- Used during login and password reset

#### `signIn(identifier, password)`

- Enhanced to accept username
- Automatically looks up the generated email for Firebase Auth

### Components Updated

1. **StudentRegistration.jsx**

   - Removed email field from registration form
   - Username-only registration
   - Real-time username availability checking
   - Automatic email generation for Firebase Auth
   - Visual feedback for username status

2. **Login.jsx**

   - Updated form to accept username
   - Enhanced validation for username format
   - Updated error messages

3. **ForgotPassword.jsx**

   - Support for username-based password reset
   - Automatic email lookup for generated emails

4. **authServices.js**

   - New username-related functions
   - Enhanced signIn function
   - Updated student signup to include generated email

## Usage Examples

### Registration

```javascript
// Student registration now only requires username
const userData = {
  firstName: 'John',
  lastName: 'Doe',
  username: 'johndoe123',
  password: 'password123'
  // email is automatically generated as: johndoe123@school123.student.local
}
```

### Login

```javascript
// Login with username only
await signIn('johndoe123', 'password123')
```

### Password Reset

```javascript
// Password reset with username
await resetPassword('johndoe123')
```

## Security Considerations

1. **Username Uniqueness**: Usernames are stored in lowercase to prevent case-sensitivity issues
2. **Generated Emails**: Unique email addresses are generated to maintain Firebase Auth compatibility
3. **Validation**: Username inputs are validated appropriately
4. **Error Handling**: Proper error messages for invalid usernames or unavailable usernames

## Migration Notes

- Existing users can continue using email-based login
- New student registrations will be username-only
- The system maintains backward compatibility with email-based authentication for existing users
- Username mappings are created automatically during registration

## Future Enhancements

1. **Username Change**: Allow users to change their username
2. **Username Display**: Show username in user profiles and dashboards
3. **Username Search**: Enable searching for users by username
4. **Username History**: Track username changes for audit purposes
5. **Optional Email**: Allow students to optionally provide a real email for notifications
