const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const { mapDBToModel } = require('../../utils');
const NotFoundError = require('../../exceptions/NotFoundError');

const TABLE_ALBUMS = 'ALBUMS';

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = nanoid(16);
    const created_at = new Date().toISOString();
    const updated_at = created_at;

    const query = {
      text: `INSERT INTO ${TABLE_ALBUMS} values($1, $2, $3, $4, $5) RETURNING id`,
      values: [id, name, year, created_at, updated_at],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbums() {
    const result = await this._pool.query(`SELECT * FROM ${TABLE_ALBUMS}`);
    return result.rows.map(mapDBToModel);
  }

  async getAlbumById(id) {
    const query = {
      text: `SELECT * FROM ${TABLE_ALBUMS} WHERE id = $1`,
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    return result.rows.map(mapDBToModel)[0];
  }

  async editAlbumById(id, { name, year }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: `UPDATE ${TABLE_ALBUMS} SET name = $1, year = $2, updated_at = $3 where id = $4 RETURNING id`,
      values: [name, year, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album, Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: `DELETE FROM ${TABLE_ALBUMS} WHERE id = $1 RETURNING id`,
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = AlbumsService;
