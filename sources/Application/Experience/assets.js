export default [
  {
    name: 'base',
    data: {},
    itemsToLoad:
      [
        { name: 'environmentModel', source: '../../../models/GDL.gltf' },

        // { name: 'blueNoise32x32Texture', source: '/blueNoises/HDR_L_2.png', type: 'texture' },
        // { name: 'stickerOnscoutTexture', source: '/models/textures/stickerOnscout.png', type: 'texture' },

        // { name: 'stickerScoutTexture', source: '/models/textures/stickerScout.png', type: 'texture' },
        // { name: 'stickerSideTexture', source: '/models/textures/stickerSide.png', type: 'texture' },
        // { name: 'stickerSmileyTexture', source: '/models/textures/stickerSmiley.png', type: 'texture' },
      ]
  },
  {
    name: 'crew',
    data: { isModel: true },
    itemsToLoad:
      [
        { name: 'model', source: '../../../models/GDL.gltf' },
        // { name: 'stickerBottomTexture', source: '/models/textures/stickerBottom06.png', type: 'texture' },
        // { name: 'stickerDescriptionTexture', source: '/models/textures/crewDescription.png', type: 'texture' },
        // { name: 'stickerTitleTexture', source: '/models/textures/crewTitle.png', type: 'texture' },
      ]
  },
  {
    name: 'privatekey',
    data: { isModel: true },
    itemsToLoad:
      [
        { name: 'model', source: '../../../models/GDL.gltf' },
        // { name: 'stickerBottomTexture', source: '/models/textures/stickerBottom05.png', type: 'texture' },
        // { name: 'stickerDescriptionTexture', source: '/models/textures/privatekeyDescription.png', type: 'texture' },
        // { name: 'stickerTitleTexture', source: '/models/textures/privatekeyTitle.png', type: 'texture' },
      ]
  },
  {
    name: 'onscout',
    data: { isModel: true },
    itemsToLoad:
      [
        { name: 'model', source: '../../../models/GDL.gltf' },
        // { name: 'stickerBottomTexture', source: '/models/textures/stickerBottom04.png', type: 'texture' },
        // { name: 'stickerDescriptionTexture', source: '/models/textures/onscoutDescription.png', type: 'texture' },
        // { name: 'stickerTitleTexture', source: '/models/textures/onscoutTitle.png', type: 'texture' },
        // { name: 'fabricColorTexture', source: '/models/textures/fabricColor.png', type: 'texture' },
        // { name: 'woodColorTexture', source: '/models/textures/woodColor.png', type: 'texture' },
      ]
  },
  {
    name: 'isonline',
    data: { isModel: true },
    itemsToLoad:
      [
        { name: 'model', source: '../../../models/GDL.gltf' },
        // { name: 'stickerBottomTexture', source: '/models/textures/stickerBottom03.png', type: 'texture' },
        // { name: 'stickerDescriptionTexture', source: '/models/textures/isonlineDescription.png', type: 'texture' },
        // { name: 'stickerTitleTexture', source: '/models/textures/isonlineTitle.png', type: 'texture' },
        // { name: 'switchGradientTexture', source: '/models/textures/switchGradient.png', type: 'texture' },
      ]
  },
  {
    name: 'ideasby',
    data: { isModel: true },
    itemsToLoad:
      [
        { name: 'model', source: '../../../models/GDL.gltf' },
        // { name: 'stickerBottomTexture', source: '/models/textures/stickerBottom02.png', type: 'texture' },
        // { name: 'stickerDescriptionTexture', source: '/models/textures/ideasbyDescription.png', type: 'texture' },
        // { name: 'stickerTitleTexture', source: '/models/textures/ideasbyTitle.png', type: 'texture' },
      ]
  },
  {
    name: 'takemeto',
    data: { isModel: true },
    itemsToLoad:
      [
        { name: 'model', source: '../../../models/GDL.gltf' },
        // { name: 'stickerBottomTexture', source: '/models/textures/stickerBottom01.png', type: 'texture' },
        // { name: 'stickerDescriptionTexture', source: '/models/textures/takemetoDescription.png', type: 'texture' },
        // { name: 'stickerTitleTexture', source: '/models/textures/takemetoTitle.png', type: 'texture' },
        // { name: 'socialsTexture', source: '/models/textures/socials.png', type: 'texture' },
      ]
  },
]