const AuthenticationError = require('../../exceptions/AuthenticationError');

class PlaylistsHandler {
  constructor(playlistService, songsService, validator) {
    this._playlistService = playlistService;
    this._songsService = songsService;
    this._validator = validator;
  }

  async postPlaylistHandler(request, h) {
    try {
      this._validator.validatePlaylistPayload(request.payload);
      const { name } = request.payload;
      const { id: userId } = request.auth.credentials;
      const playlistId = await this._playlistService.addPlaylist({ name, userId });
      const response = h.response({
        status: 'success',
        message: 'Playlist berhasil ditambahkan',
        data: {
          playlistId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }

  async getPlaylistsHandler(request, h) {
    try {
      const { id: userId } = request.auth.credentials;
      const playlists = await this._playlistService.getPlaylists(userId);
      const response = h.response({
        status: 'success',
        data: {
          playlists,
        },
      });
      return response;
    } catch (error) {
      return error;
    }
  }

  async postPlaylistSongHandler(request, h) {
    try {
      this._validator.validatePostPlaylistSongPayload(request.payload);
      const { id: playlistId } = request.params;
      const { songId } = request.payload;
      const { id: userId } = request.auth.credentials;

      if (!request.auth?.credentials) {
        throw new AuthenticationError('Anda tidak berhak mengakses resource ini');
      }

      await this._songsService.getSongById(songId);
      const playlistSongId = await this._playlistService.addPlaylistSong({
        userId,
        playlistId,
        songId,
      });
      const response = h.response({
        status: 'success',
        message: 'Playlist song berhasil ditambahkan',
        data: {
          playlistSongId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }
}

module.exports = PlaylistsHandler;
