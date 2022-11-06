const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const { mapDBToModel } = require('../../utils');
const NotFoundError = require('../../exceptions/NotFoundError');

const TABLE_SONGS = 'songs';
const TABLE_PLAYLIST_SONGS = 'playlist_songs';
class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({
    title, year, performer, genre, duration, albumId = '-',
  }) {
    const songId = `song-${nanoid(16)}`;
    const created_at = new Date().toISOString();
    const updated_at = created_at;

    const query = {
      text: `INSERT INTO ${TABLE_SONGS} values($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      values: [
        songId,
        title,
        year,
        genre,
        performer,
        duration,
        albumId,
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

  async getSongs({ title, performer }) {
    if (title && performer) {
      const result = await this._pool.query(`
      SELECT id, 
             title, 
             performer 
      FROM  ${TABLE_SONGS} 
      WHERE lower(title) LIKE '%${title?.toLowerCase()}%'
        AND lower(performer) LIKE '%${performer?.toLowerCase()}%'`);
      return result.rows.map(mapDBToModel);
    }
    if (title || performer) {
      const result = await this._pool.query(`
      SELECT id, 
             title, 
             performer 
      FROM  ${TABLE_SONGS} 
      WHERE lower(title) LIKE '%${title?.toLowerCase()}%'
         OR lower(performer) LIKE '%${performer?.toLowerCase()}%'`);
      return result.rows.map(mapDBToModel);
    }
    const result = await this._pool.query(`
      SELECT id, 
             title, 
             performer 
      FROM  ${TABLE_SONGS}`);
    return result.rows.map(mapDBToModel);
  }

  async getSongById(id) {
    const query = {
      text: `SELECT * FROM ${TABLE_SONGS} WHERE id = $1`,
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    return result.rows.map(mapDBToModel)[0];
  }

  async editSongById(id, {
    title, year, genre, performer, duration, albumId,
  }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: `UPDATE ${TABLE_SONGS} SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6, updated_at = $7 where id = $8 RETURNING id`,
      values: [title, year, genre, performer, duration, albumId, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui lagu, Id tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: `DELETE FROM ${TABLE_SONGS} WHERE id = $1 RETURNING id`,
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }
  }

  async getSongByPlaylistId(playlistId) {
    const query = {
      text: `SELECT 
      ${TABLE_SONGS}.id,
      ${TABLE_SONGS}.title,
      ${TABLE_SONGS}.performer
      FROM ${TABLE_SONGS}
      WHERE id IN (
        SELECT song_id FROM ${TABLE_PLAYLIST_SONGS}
        WHERE playlist_id = $1
      )`,
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Song tidak ditemukan');
    }
    return result.rows;
  }
}

module.exports = SongsService;
