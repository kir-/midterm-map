
INSERT INTO users (name, password) VALUES ('grayson', '123' );
INSERT INTO users (name, password) VALUES ('sean', '123' );


INSERT INTO maps (name, longitude, latitude) VALUES ('lighthouse','-123.1149943', '49.2812333');

INSERT INTO places(latitude,longitude, rating, name, type, image, address) VALUES (49.2812333, -123.1149943, 4.3,'Lighthouse Labs', 'point_of_interest', 'https://lh3.googleusercontent.com/p/AF1QipM22XOTCYeSy5r3_nCjqaA2QoNvSjmSsN9EEa3D=s1600-w200', '401 W Georgia St #600, Vancouver, BC V6B 5A1, Canada');
INSERT INTO places(latitude,longitude, rating, name, type, image, address) VALUES (49.2867409, -123.112267,4.5,'Miku Vancouver', 'night_club', 'https://lh3.googleusercontent.com/p/AF1QipMcuKKyN0HWl5k5iAVv3R-u0wKyTS2XuGdHLG_T=s1600-w200', ' 200 Granville St # 70, Vancouver, BC V6C 1S4, Canada');



INSERT INTO permission (member_id, map_id, edit) VALUES (1, 1, true);
INSERT INTO permission (member_id, map_id, edit) VALUES (2, 1, true);


INSERT INTO place_on_map (map_id, place_id) VALUES (1, 1);
INSERT INTO place_on_map (map_id, place_id) VALUES (1, 2);