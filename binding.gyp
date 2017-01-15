{
  'targets': [
    {
      "target_name": "none",
      "sources": [],
    }
  ],
  'conditions': [
    ['OS=="mac"', {
      'targets': [
        {
          "target_name": "smc",
          "sources": [ "lib/OSX/smc.h", "lib/OSX/smc.cc" ],
          "link_settings": {
                  'libraries': [
                    'IOKit.framework'
                  ]
           }
        }
      ],
    }]
  ]
}
