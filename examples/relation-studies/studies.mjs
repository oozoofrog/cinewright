// Three authored works, not a new manifest language. Frames are at 24 fps.
const key=(frame,value,interpolation='smoothstep')=>({frame,value,interpolation});
export const studies={
  cups:{title:'Two, after / 둘이 지난 자리',module:'cups.mjs',size:[960,540],fps:24,frames:480,
    points:{approach:60,near:120,answer:168,together:240,departure:264,absent:312,return:336,settled:384},
    spans:{approach:[60,120],together:[240,264],absence:[264,336],inheritance:[336,480]},
    tracks:{a:[key(0,[310,330],'hold'),key(60,[310,330]),key(120,[440,330],'hold'),key(264,[440,330]),key(312,[-120,295],'hold'),key(479,[-120,295])],
      b:[key(0,[650,330],'hold'),key(168,[650,330]),key(240,[570,330],'hold'),key(336,[570,330]),key(384,[440,330],'hold'),key(479,[440,330])]},
    // Only the green vessel stains the cloth. Marks exist because of earlier placements.
    placements:[{from:60,position:[310,330]},{from:264,position:[440,330]}],
    traceAlpha:0.34,
    score:[{frame:36,midi:48,length:2.6,amp:.19,pan:-.6},{frame:60,midi:67,length:2.1,amp:.13,pan:-.4},
      {frame:172,midi:62,length:2.5,amp:.16,pan:.6},{frame:242,midi:60,length:2.8,amp:.14,pan:0},
      {frame:242,midi:67,length:2.8,amp:.10,pan:.3},{frame:330,midi:55,length:2.4,amp:.12,pan:.3},
      {frame:384,midi:62,length:2.8,amp:.10,pan:-.2}]},
  doorway:{title:'The other side / 건너편',module:'doorway.mjs',size:[960,540],fps:24,frames:240,
    points:{sliver:48,open:84,reverse:120,empty:180},spans:{outside:[0,120],inside:[120,240]},
    score:[{frame:20,midi:45,length:2.2,amp:.14,pan:-.7},{frame:108,midi:64,length:3.8,amp:.12,pan:.65},
      {frame:128,midi:57,length:3.1,amp:.10,pan:-.1}]},
  fold:{title:'Held in the fold / 접힌 사이',module:'fold.mjs',size:[960,540],fps:24,frames:288,
    points:{left:48,right:96,closed:156,reopen:192,rest:240},spans:{closing:[48,156],held:[156,192],opening:[192,240]},
    tracks:{left:[key(0,0,'hold'),key(48,0),key(96,Math.PI,'hold'),key(192,Math.PI),key(240,.45,'hold'),key(287,.45)],
      right:[key(0,0,'hold'),key(96,0),key(156,Math.PI,'hold'),key(202,Math.PI),key(240,.45,'hold'),key(287,.45)]},
    score:[{frame:42,midi:60,length:2.1,amp:.12,pan:-.7},{frame:108,midi:67,length:2.1,amp:.12,pan:.7},
      {frame:162,midi:62,length:2.0,amp:.13,pan:0},{frame:228,midi:60,length:2.1,amp:.10,pan:-.5},
      {frame:236,midi:67,length:1.8,amp:.09,pan:.5}]}
};
