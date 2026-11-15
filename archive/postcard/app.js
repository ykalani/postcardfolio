const links = [
  ['GitHub', 'https://github.com/ykalani'], ['LinkedIn', 'https://www.linkedin.com/in/ykalani/'],
  ['Substack', 'https://substack.com/@ykalani'], ['Instagram', 'https://www.instagram.com/_yashtagram'],
  ['Spotify', 'https://open.spotify.com/user/wryc9ygbfzza83otspz3wrdd2'], ['Airbuds', 'https://i.airbuds.fm/ykal/yGCsWrQ6Uo'],
  ['Letterboxd', 'https://letterboxd.com/ykalani'], ['Goodreads', 'https://www.goodreads.com/user/show/202569379-yash-kalani'],
  ['Beli', 'https://beliapp.co/app/ykalani'], ['MyAnimeList', 'https://myanimelist.net/profile/ykal'],
  ['Chess.com', 'https://www.chess.com/member/minimagnus2017'], ['Discord', 'https://discord.com/users/733835629926023209'],
  ['Clash Royale', 'https://link.clashroyale.com/invite/friend/en?tag=2VGYGC8Q0'], ['Brawl Stars', 'https://link.brawlstars.com/invite/friend/en/?tag=GUPPR8UYC'],
  ['Admonymous', 'https://www.admonymous.co/yash-kalani'], ['Email', 'mailto:kalaniya@msu.edu']
];
const list = document.querySelector('#link-list');
for (const [name, url] of links) {
  const a = document.createElement('a');
  a.href = url; a.target = '_blank'; a.rel = 'noreferrer'; a.append(name);
  const arrow = document.createElement('span'); arrow.textContent = '↗'; arrow.setAttribute('aria-hidden', 'true');
  a.append(arrow); list.append(a);
}
const card = document.querySelector('#postcard');
document.querySelector('#flip').addEventListener('click', (event) => {
  const back = document.querySelector('#addresses');
  back.hidden = !back.hidden;
  document.querySelector('#message').hidden = !back.hidden;
  event.currentTarget.innerHTML = back.hidden ? 'Turn over for links <span aria-hidden="true">↪</span>' : 'Back to the note <span aria-hidden="true">↪</span>';
});
const show = document.querySelector('#show');
document.querySelector('#hide').addEventListener('click', () => { card.hidden = true; show.hidden = false; show.focus(); });
show.addEventListener('click', () => { card.hidden = false; show.hidden = true; document.querySelector('#flip').focus(); });
window.breezePaused = matchMedia('(prefers-reduced-motion: reduce)').matches;
