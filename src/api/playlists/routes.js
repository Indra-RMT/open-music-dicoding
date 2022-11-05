const routes = (handler) => [
  {
    method: 'POST',
    path: '/playlists',
    handler: (request, h) => handler.postPlaylistHandler(request, h),
    options: {
      auth: 'openmusic_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlists',
    handler: (request, h) => handler.getPlaylistsHandler(request, h),
    options: {
      auth: 'openmusic_jwt',
    },
  },
  // {
  //   method: 'DELETE',
  //   path: '/playlists/{id}',
  //   handler: (request) => handler.deletePlaylistByIdHandler(request),
  // },
  {
    method: 'POST',
    path: '/playlists/{id}/songs',
    handler: (request, h) => handler.postPlaylistSongHandler(request, h),
    options: {
      auth: 'openmusic_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlists/{id}/songs',
    handler: (request) => handler.getPlaylistSongsHandler(request),
    options: {
      auth: 'openmusic_jwt',
    },
  },
  // {
  //   method: 'DELETE',
  //   path: '/playlists/{id}/songs',
  //   handler: (request) => handler.deleteSongPlaylistHandler(request),
  // },
];

module.exports = routes;
