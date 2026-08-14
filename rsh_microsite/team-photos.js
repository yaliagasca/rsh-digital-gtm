window.TEAM_PHOTO_SPRITE='team-photos/team-portraits-sprite.jpg';
window.TEAM_PHOTOS={
  darin:[0,0], amy:[1,0], tim:[2,0], peter:[3,0],
  nate:[0,1], april:[1,1], benjamin:[2,1], justin:[3,1],
  dan:[0,2], maddie:[1,2], jessica:[2,2], nofil:[3,2],
  rock:[0,3], andrea:[1,3]
};

const teamPhotoStylesheet=document.createElement('link');
teamPhotoStylesheet.rel='stylesheet';
teamPhotoStylesheet.href='team-photos.css';
document.head.appendChild(teamPhotoStylesheet);
