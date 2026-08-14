window.TEAM_PHOTO_SPRITE='team-photos/team-portraits-sprite.jpg';
window.TEAM_PHOTOS={
  darin:[0,0], amy:[1,0], tim:[2,0], peter:[3,0],
  nate:[0,1], april:[1,1], benjamin:[2,1], justin:[3,1],
  dan:[0,2], maddie:[1,2], jessica:[2,2], nofil:[3,2],
  rock:[0,3], andrea:[1,3]
};

const teamPhotoStyle=document.createElement('style');
teamPhotoStyle.textContent=`
.team-photo-sprite{
  display:block;width:100%;height:100%;
  background-image:url('${window.TEAM_PHOTO_SPRITE}');
  background-repeat:no-repeat;background-size:400% 400%;
  background-position:calc(var(--photo-x) * 33.333333%) calc(var(--photo-y) * 33.333333%);
  background-color:#fff;
}
.selector-avatar{background:#fff!important;box-shadow:0 0 0 1px rgba(255,255,255,.18)}
.profile-photo{height:230px!important;background:#fff!important;border:1px solid #e6eaf0;border-radius:115px 115px 14px 14px!important}
.profile-photo-img,.selector-avatar-img{display:block;width:100%;height:100%}
@media(max-width:1100px){.profile-photo{height:210px!important}}
@media(max-width:650px){.profile-photo{height:220px!important}}
`;
document.head.appendChild(teamPhotoStyle);
