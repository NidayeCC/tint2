{
  'variables': {
    'asan%': 0,
    'werror': '',
    'visibility%': 'hidden',          # V8's visibility setting
    'target_arch%': 'x64',            # set v8's target architecture
    'host_arch%': 'x64',              # set v8's host architecture
    'want_separate_host_toolset%': 0, # V8 should not build target and host
    'library%': 'static_library',     # allow override to 'shared_library' for DLL/.so builds
    'component%': 'static_library',   # NB. these names match with what V8 expects
    'msvs_multi_core_compile': '0',   # we do enable multicore compiles, but not using the V8 way
    'gcc_version%': 'unknown',
    'icu_small': 'false',
    'clang%': 1,
    'python%': 'python',
    'uv_library': 'static_library',
    'uv_parent_path': '/libraries/node/deps/uv/',
    'uv_use_dtrace': 'true',
    'v8_enable_i18n_support': 0,
    'v8_optimized_debug': 0,
    'v8_random_seed': 0,
    'want_separate_host_toolset': 0,
    'node_byteorder': 'big',
    'v8_use_external_startup_data': 0,

    # Enable disassembler for `--print-code` v8 options
    'v8_enable_disassembler': 1,

    # Enable V8's post-mortem debugging only on unix flavors.
    'conditions': [
      ['OS == "win"', {
        'os_posix': 0,
        'v8_postmortem_support': 'false',
        'node_use_dtrace': 'false',
        'node_has_winsdk': 'true',
        'v8_no_strict_aliasing': 1
      }, {
        'os_posix': 1,
        'v8_postmortem_support': 'true',
        'node_use_dtrace': 'true',
        'node_has_winsdk': 'false',
        'v8_no_strict_aliasing': 0
      }],
      ['GENERATOR == "ninja" or OS== "mac"', {
        'OBJ_DIR': '<(PRODUCT_DIR)/obj',
        'V8_BASE': '<(PRODUCT_DIR)/libv8_base.a',
      }, {
        'OBJ_DIR': '<(PRODUCT_DIR)/obj.target',
        'V8_BASE': '<(PRODUCT_DIR)/obj.target/deps/v8/tools/gyp/libv8_base.a',
      }],
      ['openssl_fips != ""', {
        'OPENSSL_PRODUCT': 'libcrypto.a',
      }, {
        'OPENSSL_PRODUCT': 'libopenssl.a',
      }],
    ],
  },

  'target_defaults': {
    'default_configuration': 'Release',
    'configurations': {
      'Debug': {
        'variables':{
          'runtime':3,
          'v8_enable_handle_zapping%': 1,
        },
        'defines': [ 'DEBUG', '_DEBUG' ],
        'cflags': [ '-g', '-O0' ],
        'conditions': [
          ['target_arch=="x64"', {
            'msvs_configuration_platform': 'x64',
          }],
        ],
        'msvs_settings': {
          'VCCLCompilerTool': {
            'RuntimeLibrary': 3, # /MDd
            'Optimization': 0, # /Od, no optimization
            'MinimalRebuild': 'false',
            'OmitFramePointers': 'false',
            #'BasicRuntimeChecks': 3, # /RTC1
            'RuntimeTypeInfo': 'true',
            'ExceptionHandling': 2, # /EHa
          },
          'VCLinkerTool': {
            'LinkIncremental': 1, # /LINKINCREMENTAL:NO
            'GenerateDebugInformation': 'true',
          },
        },
        'xcode_settings': {
          'GCC_OPTIMIZATION_LEVEL': '0', # stop gyp from defaulting to -Os
        },
      },
      'Release': {
        'variables':{
          'runtime':3,
          'v8_enable_handle_zapping%': 0,
        },
        'cflags': [ '-O3', '-ffunction-sections', '-fdata-sections' ],
        'conditions': [
          ['target_arch=="x64"', {
            'msvs_configuration_platform': 'x64',
          }],
          ['OS=="solaris"', {
            # pull in V8's postmortem metadata
            'ldflags': [ '-Wl,-z,allextract' ]
          }],
          ['clang == 0 and gcc_version >= 40 and OS!="linux"', {
            'cflags': [ '-fno-tree-vrp' ],  # Work around compiler bug.
          }],
          ['clang == 0 and gcc_version <= 44', {
            'cflags': [ '-fno-tree-sink' ],  # Work around compiler bug.
          }],
          ['OS!="mac" and OS!="win"', {
            'cflags': [ '-fno-omit-frame-pointer' ],
          }],
        ],
        'msvs_settings': {
          'VCCLCompilerTool': {
            'RuntimeLibrary': 2, # /MD - release
            'Optimization': 3, # /Ox, full optimization
            'FavorSizeOrSpeed': 1, # /Ot, favour speed over size
            'InlineFunctionExpansion': 2, # /Ob2, inline anything eligible
            'WholeProgramOptimization': 'false',
            'OmitFramePointers': 'true',
            'EnableFunctionLevelLinking': 'true',
            'EnableIntrinsicFunctions': 'true',
            'ExceptionHandling': 2, # /EHa
            'AdditionalOptions': [
              '/MP', # compile across multiple CPUs
            ],
          },
          'VCLibrarianTool': {
            'LinkTimeCodeGeneration': 'true',
            'AdditionalOptions': [
            ],
          },
          'VCLinkerTool': {
            'OptimizeReferences': 2, # /OPT:REF
            'EnableCOMDATFolding': 2, # /OPT:ICF
            'LinkIncremental': 1, # /LINKINCREMENTAL:NO
          },
        },
      }
    },
    # Forcibly disable -Werror.  We support a wide range of compilers, it's
    # simply not feasible to squelch all warnings, never mind that the
    # libraries in deps/ are not under our control.
    'cflags!': ['-Werror'],
    'msvs_settings%': {
      'VCCLCompilerTool': {
        'RuntimeTypeInfo': 'false',
        'StringPooling': 'true', # pool string literals
        'DebugInformationFormat': 3, # Generate a PDB
        'WarningLevel': 3,
        'BufferSecurityCheck': 'true',
        'ExceptionHandling': 2, # /EHa
        'SuppressStartupBanner': 'true',
        'WarnAsError': 'false',
      },
      'VCLibrarianTool': {
      },
      'VCLinkerTool': {
        'conditions': [
          ['target_arch=="x64"', {
            'TargetMachine' : 17 # /MACHINE:X64
          }],
        ],
        'GenerateDebugInformation': 'true',
        'GenerateMapFile': 'true', # /MAP
        'MapExports': 'true', # /MAPINFO:EXPORTS
        'RandomizedBaseAddress': 2, # enable ASLR
        'DataExecutionPrevention': 2, # enable DEP
        'AllowIsolation': 'true',
        'SuppressStartupBanner': 'true',
        'target_conditions': [
          ['_type=="executable"', {
            #'SubSystem': 1, # console executable
          }],
        ]
      },
    },
    'msvs_disabled_warnings': [4351, 4355, 4800],
    'conditions': [
      ['OS == "win"', {
        'msvs_cygwin_shell': 0, # prevent actions from trying to use cygwin
        'defines': [
          'WIN32',
          '_DLL', # neccessary in order to use /MD (msvcrt.lib/msvcr110.dll) 
                  # instead of /MT (libcmt.lib), we need /MD to include CLR
                  # (/CLR) compiled options, as /MT isn't compatible with CLR.
                  # note we do not actually produce a DLL, we just need to
                  # send out a note that we intend to dynamically link 
                  # our internals (even as a EXE). To produce a real DLL
                  # we'd need to include /LD.
          # we don't really want VC++ warning us about
          # how dangerous C functions are...
          '_CRT_SECURE_NO_DEPRECATE',
          # ... or that C implementations shouldn't use
          # POSIX names
          '_CRT_NONSTDC_NO_DEPRECATE',
          # Make sure the STL doesn't try to use exceptions
          '_HAS_EXCEPTIONS=0',
          'BUILDING_V8_SHARED=1',
          'BUILDING_UV_SHARED=1'
        ],
      }],
      [ 'OS in "linux freebsd openbsd solaris"', {
        'cflags': [ '-pthread', ],
        'ldflags': [ '-pthread' ],
      }],
      [ 'OS in "linux freebsd openbsd solaris android"', {
        'cflags': [ '-Wall', '-Wextra', '-Wno-unused-parameter', ],
        'cflags_cc': [ '-fno-rtti', '-fno-exceptions' ],
        'ldflags': [ '-rdynamic' ],
        'target_conditions': [
          ['_type=="static_library"', {
            'standalone_static_library': 1, # disable thin archive which needs binutils >= 2.19
          }],
        ],
        'conditions': [
          [ 'target_arch=="ia32"', {
            'cflags': [ '-m32' ],
            'ldflags': [ '-m32' ],
          }],
          [ 'target_arch=="x64"', {
            'cflags': [ '-m64' ],
            'ldflags': [ '-m64' ],
          }],
          [ 'OS=="solaris"', {
            'cflags': [ '-pthreads' ],
            'ldflags': [ '-pthreads' ],
            'cflags!': [ '-pthread' ],
            'ldflags!': [ '-pthread' ],
          }],
        ],
      }],
      [ 'OS=="android"', {
        'defines': ['_GLIBCXX_USE_C99_MATH'],
        'libraries': [ '-llog' ],
      }],
      ['OS=="mac"', {
        'defines': ['_DARWIN_USE_64_BIT_INODE=1'],
        'xcode_settings': {
          'SDKROOT': '<!(xcrun --show-sdk-path)',   # added for Tint
          'PROJECT_DIR': '<@(DEPTH)/build/xcode/',  # added for Tint
          'SYMROOT': '<@(DEPTH)/build/xcode/',      # added for Tint
          'OBJROOT': '<@(DEPTH)/build/xcode/',      # added for Tint
          'ALWAYS_SEARCH_USER_PATHS': 'NO',
          'GCC_CW_ASM_SYNTAX': 'NO',                # No -fasm-blocks
          'GCC_DYNAMIC_NO_PIC': 'NO',               # No -mdynamic-no-pic
                                                    # (Equivalent to -fPIC)
          'GCC_ENABLE_CPP_EXCEPTIONS': 'NO',        # -fno-exceptions
          'GCC_ENABLE_CPP_RTTI': 'NO',              # -fno-rtti
          'GCC_ENABLE_PASCAL_STRINGS': 'NO',        # No -mpascal-strings
          'GCC_THREADSAFE_STATICS': 'NO',           # -fno-threadsafe-statics
          'PREBINDING': 'NO',                       # No -Wl,-prebind
          'MACOSX_DEPLOYMENT_TARGET': '10.7',       # -mmacosx-version-min=10.7, chng from 10.5
          'USE_HEADERMAP': 'NO',
          'GCC_SYMBOLS_PRIVATE_EXTERN': 'NO',       # required for node module being imported
          'GCC_INLINES_ARE_PRIVATE_EXTERN': 'NO',   # required for node module being imported
          'CLANG_CXX_LANGUAGE_STANDARD': 'gnu++0x',
          'OTHER_CFLAGS': [
            '-fno-strict-aliasing',
            # '-fobjc-runtime=macosx',                # added for Tint, objc runtime
          ],
          'OTHER_LDFLAGS':[
            '-framework Carbon',                    # added for Tint
            '-framework AppKit',                    # added for Tint
          ],
          'WARNING_CFLAGS': [
            '-Wall',
            '-Wendif-labels',
            '-W',
            '-Wno-unused-parameter',
          ],
        },
        'target_conditions': [
          ['_type!="static_library"', {
            'xcode_settings': {'OTHER_LDFLAGS': ['-Wl,-search_paths_first']},
          }],
        ],
        'conditions': [
          ['target_arch=="ia32"', {
            'xcode_settings': {'ARCHS': ['i386']},
          }],
          ['target_arch=="x64"', {
            'xcode_settings': {'ARCHS': ['x86_64']},
          }],
        ],
      }],
      ['OS=="freebsd" and node_use_dtrace=="true"', {
        'libraries': [ '-lelf' ],
      }],
      ['OS=="freebsd"', {
        'ldflags': [
          '-Wl,--export-dynamic',
        ],
      }]
    ],
  }
}
