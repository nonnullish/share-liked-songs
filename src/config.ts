import { SCOPES } from '@interfaces/users'

export const config = {
  client_id: '05bff6f3b4d4467494c8be1b7895403e',
  redirect_uri: import.meta.env.VITE_BASE_URL,
  scope: [SCOPES.USER_READ_PRIVATE, SCOPES.USER_READ_EMAIL, SCOPES.PLAYLIST_MODIFY_PUBLIC, SCOPES.USER_LIBRARY_READ].join(' ')
}

export const endpoints = {
  auth: 'https://accounts.spotify.com/authorize',
  token: 'https://accounts.spotify.com/api/token',
}
