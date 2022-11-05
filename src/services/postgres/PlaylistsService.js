const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const { mapDBToModel } = require('../../utils');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const NotFoundError = require('../../exceptions/NotFoundError');

const TABLE_PLAYLISTS = 'playlists';
const TABLE_PLAYLIST_SONGS = 'playlist_songs';
const TABLE_USERS = 'users';

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async verifyPlaylistOwner(playlistId, owner) {
    const query = {
      text: `SELECT * FROM ${TABLE_PLAYLISTS} WHERE id = $1`,
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
      text: `INSERT INTO ${TABLE_PLAYLISTS} values($1, $2, $3, $4, $5) RETURNING id`,
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
      ${TABLE_PLAYLISTS}.id,
      ${TABLE_PLAYLISTS}.name,
      ${TABLE_USERS}.username 
      FROM ${TABLE_PLAYLISTS}
      LEFT JOIN ${TABLE_USERS} ON ${TABLE_USERS}.id = ${TABLE_PLAYLISTS}.owner
      WHERE ${TABLE_PLAYLISTS}.owner = $1 OR ${TABLE_USERS}.id = $1`,
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
      text: `INSERT INTO ${TABLE_PLAYLIST_SONGS} values($1, $2, $3, $4, $5) RETURNING id, playlist_id`,
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
      ${TABLE_PLAYLISTS}.id,
      ${TABLE_PLAYLISTS}.name,
      ${TABLE_USERS}.username
      FROM ${TABLE_PLAYLISTS}
      LEFT JOIN ${TABLE_USERS} ON ${TABLE_USERS}.id = ${TABLE_PLAYLISTS}.owner
      WHERE ${TABLE_PLAYLISTS}.id = $1`,
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    return result.rows[0];
  }
}

module.exports = PlaylistsService;
