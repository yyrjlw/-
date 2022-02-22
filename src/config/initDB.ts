export default [
    `CREATE TABLE IF NOT EXISTS dictionary(
        "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
        "name" TEXT(50) NOT NULL,
        "value" TEXT,
        "enable" integer DEFAULT 1
    )`,
    `INSERT INTO dictionary(name,value) VALUES('tag','默认')`,
    `INSERT INTO dictionary(name,value) VALUES('tag','化验')`,
    `INSERT INTO dictionary(name,value) VALUES('tag','处方')`,
    `INSERT INTO dictionary(name,value) VALUES('tag','血压')`,
    `INSERT INTO dictionary(name,value) VALUES('folder','示例')`,
    `CREATE TABLE IF NOT EXISTS medical_history(
        "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
        "folder_id" integer NOT NULL,
        "content" TEXT,
        "medical_time" TEXT
    )`,
    `INSERT INTO medical_history(folder_id,content,medical_time) VALUES(
        (SELECT id FROM dictionary WHERE name='folder' AND value='示例' limit 1),
        '低压80   高压110',
        '2020-01-10 10:00'
    ),(
        (SELECT id FROM dictionary WHERE name='folder' AND value='示例' limit 1),
        '药物1药物2',
        '2021-01-21 10:00'
    )`,
    `CREATE TABLE IF NOT EXISTS medical_history_pictures(
        "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
        "medical_history_id" integer NOT NULL,
        "file_name" TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS medical_history_tags(
        "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
        "medical_history_id" integer NOT NULL,
        "dic_id" integer NOT NULL
    )`,
    `INSERT INTO medical_history_tags(medical_history_id,dic_id) VALUES
        ( 1, (SELECT id FROM dictionary WHERE name='tag' AND value='默认' limit 1) ),
        ( 1, (SELECT id FROM dictionary WHERE name='tag' AND value='血压' limit 1) ),
        ( 2, (SELECT id FROM dictionary WHERE name='tag' AND value='化验' limit 1) ),
        ( 2, (SELECT id FROM dictionary WHERE name='tag' AND value='处方' limit 1) )`,

]