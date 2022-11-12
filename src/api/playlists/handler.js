const AuthenticationError = require('../../exceptions/AuthenticationError');

class PlaylistsHandler {
  constructor(playlistsService, songsService, validator) {
    this._playlistsService = playlistsService;
    this._songsService = songsService;
    this._validator = validator;
  }

  async postPlaylistHandler(request, h) {
    try {
      this._validator.validatePlaylistPayload(request.payload);
      const { name } = request.payload;
      const { id: userId } = request.auth.credentials;
      const playlistId = await this._playlistsService.addPlaylist({ name, userId });
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
      const playlists = await this._playlistsService.getPlaylists(userId);
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
      const playlistSongId = await this._playlistsService.addPlaylistSong({
        userId,
        playlistId,
        songId,
      });
      const response = h.response({
        status: 'success',
        message: 'Playlist song berhasil ditambahkan',
        data: {
          ...playlistSongId[0],
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }

  async getPlaylistSongsHandler(request) {
    const { id: playlistId } = request.params;
    const { id: userId } = request.auth.credentials;
    const playlist = await this._playlistsService.getPlaylistSongs(userId, playlistId);
    const songs = await this._songsService.getSongByPlaylistId(playlistId);
    const result = {
      status: 'success',
      data: {
        playlist: {
          ...playlist,
          songs,
        },
      },
    };
    return result;
  }

  async deleteSongPlaylistHandler(request) {
    this._validator.validateDeletePlaylistSongPayload(request.payload);
    const { id: playlistId } = request.params;
    const { songId } = request.payload;
    const { id: userId } = request.auth.credentials;
    await this._playlistsService.deleteSongPlaylist(playlistId, songId, userId);
    const result = {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    };
    return result;
  }

  async deletePlaylistByIdHandler(request) {
    const { id: playlistId } = request.params;
    const { id: userId } = request.auth.credentials;
    await this._playlistsService.deletePlaylist(playlistId, userId);
    const result = {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
    return result;
  }
}

module.exports = PlaylistsHandler;
