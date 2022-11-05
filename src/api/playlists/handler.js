class UsersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  async postPlaylistHandler(request, h) {
    try {
      this._validator.validatePlaylistPayload(request.payload);
      const { name } = request.payload;
      const { id: userId } = request.auth.credentials;
      const playlistId = await this._service.addPlaylist({ name, userId });
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
      const playlists = await this._service.getPlaylists(userId);
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
}

module.exports = UsersHandler;
