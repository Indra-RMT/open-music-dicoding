const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const { mapDBToModel } = require('../../utils');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const NotFoundError = require('../../exceptions/NotFoundError');

const PLAYLISTS = 'playlists';
const PLAYLIST_SONGS = 'playlist_songs';
const USERS = 'users';

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async verifyPlaylistOwner(playlistId, owner) {
    const query = {
      text: `SELECT * FROM ${PLAYLISTS} WHERE id = $1`,
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    const note = result.rows[0];
    if (note.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async addPlaylist({ name, userId }) {
    const playlistId = `playlist-${nanoid(16)}`;
    const created_at = new Date().toISOString();
    const updated_at = created_at;

    const query = {
      text: `INSERT INTO ${PLAYLISTS} values($1, $2, $3, $4, $5) RETURNING id`,
      values: [
        playlistId,
        name,
        userId,
        created_at,
        updated_at,
      ],
    };
    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async getPlaylists(userId) {
    const query = {
      text: `SELECT
      ${PLAYLISTS}.id,
      ${PLAYLISTS}.name,
      ${USERS}.username 
      FROM ${PLAYLISTS}
      LEFT JOIN ${USERS} ON ${USERS}.id = ${PLAYLISTS}.owner
      WHERE ${PLAYLISTS}.owner = $1 OR ${USERS}.id = $1`,
      values: [userId],
    };
    const playlistsResult = await this._pool.query(query);
    return playlistsResult.rows.map(mapDBToModel);
  }

  async addPlaylistSong({ userId, playlistId, songId }) {
    const playlistSongId = `playlist-song-${nanoid(16)}`;
    const created_at = new Date().toISOString();
    const updated_at = created_at;
    await this.verifyPlaylistOwner(playlistId, userId);
    const query = {
      text: `INSERT INTO ${PLAYLIST_SONGS} values($1, $2, $3, $4, $5) RETURNING id, playlist_id`,
      values: [
        playlistSongId,
        playlistId,
        songId,
        created_at,
        updated_at,
      ],
    };
    const result = await this._pool.query(query);
    return result.rows.map(mapDBToModel);
  }

  async getPlaylistSongs(userId, playlistId) {
    await this.verifyPlaylistOwner(playlistId, userId);
    const query = {
      text: `SELECT
      ${PLAYLISTS}.id,
      ${PLAYLISTS}.name,
      ${USERS}.username
      FROM ${PLAYLISTS}
      LEFT JOIN ${USERS} ON ${USERS}.id = ${PLAYLISTS}.owner
      WHERE ${PLAYLISTS}.id = $1`,
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async deleteSongPlaylist(playlistId, songId, userId) {
    await this.verifyPlaylistOwner(playlistId, userId);
    const query = {
      text: `DELETE FROM ${PLAYLIST_SONGS} WHERE playlist_id = $1 AND song_id = $2 RETURNING id`,
      values: [playlistId, songId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }
  }

  async deletePlaylist(playlistId, userId) {
    await this.verifyPlaylistOwner(playlistId, userId);
    const queryPlaylist = {
      text: `DELETE FROM ${PLAYLISTS} WHERE id = $1 RETURNING id`,
      values: [playlistId],
    };
    const queryPlaylistSong = {
      text: `DELETE FROM ${PLAYLIST_SONGS} WHERE playlist_id = $1 RETURNING id`,
      values: [playlistId],
    };
    await this._pool.query(queryPlaylistSong);
    const result = await this._pool.query(queryPlaylist);
    if (!result.rows.length) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = PlaylistsService;
